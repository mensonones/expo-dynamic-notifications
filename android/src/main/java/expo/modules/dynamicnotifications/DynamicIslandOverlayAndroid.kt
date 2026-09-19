package expo.modules.dynamicnotifications

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.app.Activity
import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

class DynamicIslandOverlayAndroid(private val activity: Activity) {
    private var currentOverlay: DynamicIslandContainerView? = null
    private val handler = Handler(Looper.getMainLooper())
    private var dismissRunnable: Runnable? = null

    fun show(
        payload: Map<String, Any?>,
        onPress: () -> Unit,
        onDismiss: () -> Unit
    ) {
        activity.runOnUiThread {
            dismissCurrent(animate = false)

            val decorView = activity.window.decorView as? ViewGroup ?: return@runOnUiThread
            val statusBarHeight = getStatusBarHeight()

            val overlay = DynamicIslandContainerView(activity, statusBarHeight, payload, onPress) {
                dismissCurrent(animate = false, onDismiss = onDismiss)
            }

            decorView.addView(overlay, FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ))
            currentOverlay = overlay

            val duration = (payload["duration"] as? Number)?.toLong() ?: 3500L
            if (duration > 0) {
                dismissRunnable = Runnable {
                    dismissCurrent(animate = true, onDismiss = onDismiss)
                }
                handler.postDelayed(dismissRunnable!!, duration)
            }
        }
    }

    fun dismissCurrent(animate: Boolean = true, onDismiss: (() -> Unit)? = null) {
        activity.runOnUiThread {
            dismissRunnable?.let { handler.removeCallbacks(it) }
            dismissRunnable = null

            val overlay = currentOverlay ?: return@runOnUiThread
            currentOverlay = null

            if (animate) {
                overlay.startDismissAnimation {
                    (overlay.parent as? ViewGroup)?.removeView(overlay)
                    onDismiss?.invoke()
                }
            } else {
                (overlay.parent as? ViewGroup)?.removeView(overlay)
                onDismiss?.invoke()
            }
        }
    }

    private fun getStatusBarHeight(): Int {
        var result = 0
        val resourceId = activity.resources.getIdentifier("status_bar_height", "dimen", "android")
        if (resourceId > 0) {
            result = activity.resources.getDimensionPixelSize(resourceId)
        }
        return result
    }
}

// MARK: - Container Overlay que gerencia a Ilha Dinâmica, o Pescoço Líquido e o Card
class DynamicIslandContainerView(
    context: Context,
    private val statusBarHeight: Int,
    private val payload: Map<String, Any?>,
    private val onPress: () -> Unit,
    private val onDismissCompleted: () -> Unit
) : FrameLayout(context) {

    private val density = resources.displayMetrics.density
    private val islandWidth = 126f * density
    private val islandHeight = 37f * density
    private val topOffset = statusBarHeight.toFloat() + 4f * density
    private val islandBottomY get() = topOffset + islandHeight

    // Medidas 1:1 calculadas a partir do vídeo de referência
    private val cardGapFromIsland = 32f * density
    private val targetCardHeight = 74f * density
    private val targetCardTop get() = islandBottomY + cardGapFromIsland
    private val restingCenterY get() = targetCardTop + targetCardHeight / 2f
    private val targetCardWidth = Math.min(resources.displayMetrics.widthPixels - 32f * density, 408f * density)

    // Estados de animação física
    private var dropletY = islandBottomY
    private var neckProgress = 1.0f
    private var islandStretch = 0.0f
    private var cardCurrentWidth = 54f * density
    private var cardCurrentHeight = 54f * density
    private var contentOpacity = 0.0f
    private var dragOffsetY = 0.0f
    private var isDismissing = false

    // Tintas para desenho
    private val neckPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val islandPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLACK
        style = Paint.Style.FILL
    }

    private lateinit var cardView: FrameLayout
    private lateinit var cardContentLayout: LinearLayout

    init {
        setWillNotDraw(false)
        setupCardLayout()
        startEntranceAnimation()
    }

    private fun setupCardLayout() {
        val title = payload["title"] as? String ?: ""
        val message = payload["message"] as? String
        val avatarUrl = payload["avatarUrl"] as? String
        val accentHex = payload["accentColor"] as? String ?: "#2F9BFF"

        cardView = FrameLayout(context).apply {
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = targetCardHeight / 2f
                setColor(Color.WHITE)
                setStroke((0.6f * density).toInt(), Color.parseColor("#10000000"))
            }
            background = bg
            elevation = 14f * density
            clipToOutline = false
        }

        cardContentLayout = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding((16 * density).toInt(), 0, (16 * density).toInt(), 0)
            alpha = 0f
        }

        // Avatar circular à esquerda (48x48 dp)
        val avatarSize = (48 * density).toInt()
        val avatarView = ImageView(context).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            clipToOutline = true
            outlineProvider = object : android.view.ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setOval(0, 0, view.width, view.height)
                }
            }

            val placeholder = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                try {
                    val c = Color.parseColor(accentHex)
                    setColor(Color.argb(40, Color.red(c), Color.green(c), Color.blue(c)))
                } catch (e: Exception) {
                    setColor(Color.parseColor("#E5E5EA"))
                }
            }
            background = placeholder
            layoutParams = LinearLayout.LayoutParams(avatarSize, avatarSize).apply {
                marginEnd = (14 * density).toInt()
            }
        }

        // Carrega imagem do avatar com fallbacks robustos
        if (!avatarUrl.isNullOrEmpty()) {
            Thread {
                try {
                    val bitmap: Bitmap? = when {
                        avatarUrl.startsWith("data:image") -> {
                            val base64Data = avatarUrl.substringAfter("base64,")
                            val decoded = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)
                            BitmapFactory.decodeByteArray(decoded, 0, decoded.size)
                        }
                        avatarUrl.startsWith("content://") || avatarUrl.startsWith("file://") -> {
                            val uri = android.net.Uri.parse(avatarUrl)
                            context.contentResolver.openInputStream(uri)?.use {
                                BitmapFactory.decodeStream(it)
                            }
                        }
                        avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://") -> {
                            val conn = java.net.URL(avatarUrl).openConnection() as java.net.HttpURLConnection
                            conn.connectTimeout = 3000
                            conn.readTimeout = 3000
                            conn.inputStream.use {
                                BitmapFactory.decodeStream(it)
                            }
                        }
                        else -> {
                            val resId = context.resources.getIdentifier(avatarUrl, "drawable", context.packageName)
                            if (resId != 0) {
                                BitmapFactory.decodeResource(context.resources, resId)
                            } else null
                        }
                    }

                    val finalBitmap = bitmap ?: run {
                        val resId = context.resources.getIdentifier("noah", "drawable", context.packageName)
                        if (resId != 0) BitmapFactory.decodeResource(context.resources, resId) else null
                    }

                    if (finalBitmap != null) {
                        post { avatarView.setImageBitmap(finalBitmap) }
                    }
                } catch (e: Exception) {
                    val resId = context.resources.getIdentifier("noah", "drawable", context.packageName)
                    if (resId != 0) {
                        val bmp = BitmapFactory.decodeResource(context.resources, resId)
                        post { avatarView.setImageBitmap(bmp) }
                    }
                }
            }.start()
        }
        cardContentLayout.addView(avatarView)

        // Textos centralizados à esquerda
        val textContainer = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }

        val titleView = TextView(context).apply {
            text = title
            setTextColor(Color.parseColor("#111111"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
        }
        textContainer.addView(titleView)

        if (!message.isNullOrEmpty()) {
            val messageView = TextView(context).apply {
                text = message
                setTextColor(Color.parseColor("#7E8085"))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
                typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                maxLines = 1
            }
            textContainer.addView(messageView)
        }
        cardContentLayout.addView(textContainer)

        // Ícone vetor person.badge.plus à direita
        val iconView = FollowBadgeIconView(context).apply {
            layoutParams = LinearLayout.LayoutParams((32 * density).toInt(), (32 * density).toInt())
        }
        cardContentLayout.addView(iconView)

        cardView.addView(cardContentLayout, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))

        // Adiciona o card ao container
        val cardParams = LayoutParams(cardCurrentWidth.toInt(), cardCurrentHeight.toInt()).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            topMargin = (dropletY - cardCurrentHeight / 2f).toInt()
        }
        addView(cardView, cardParams)

        // Gestos de toque e arrasto vertical (swipe up para fechar)
        var startY = 0f
        cardView.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val delta = event.rawY - startY
                    if (delta < 0) {
                        dragOffsetY = delta
                        cardView.translationY = dragOffsetY
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val delta = event.rawY - startY
                    if (delta < -20 * density) {
                        startDismissAnimation { onDismissCompleted() }
                    } else if (Math.abs(delta) < 10) {
                        onPress()
                    } else {
                        cardView.animate().translationY(0f).setDuration(200).start()
                    }
                    true
                }
                else -> false
            }
        }
    }

    override fun dispatchDraw(canvas: Canvas) {
        val cx = width / 2f

        // 1. Desenha o cardView (conteúdo, avatar, textos)
        super.dispatchDraw(canvas)

        // 2. Desenha o Pescoço Líquido (Metaball Teardrop)
        if (neckProgress > 0.01f) {
            val path = Path()
            val wTop = 84f * density * neckProgress
            val wNeck = Math.max(8f * density, 30f * density * neckProgress)
            val r = cardCurrentHeight / 2f
            val yTop = islandBottomY + islandStretch
            val yDrop = dropletY

            if (yDrop > yTop) {
                path.moveTo(cx - wTop / 2f, yTop)
                path.cubicTo(
                    cx - wNeck / 2f - 4f * density, yTop + (yDrop - yTop) * 0.40f,
                    cx - r - 2f * density, yDrop - r * 0.55f,
                    cx - r, yDrop
                )
                path.arcTo(
                    RectF(cx - r, yDrop - r, cx + r, yDrop + r),
                    180f,
                    -180f,
                    false
                )
                path.cubicTo(
                    cx + r + 2f * density, yDrop - r * 0.55f,
                    cx + wNeck / 2f + 4f * density, yTop + (yDrop - yTop) * 0.40f,
                    cx + wTop / 2f, yTop
                )
                path.close()

                neckPaint.shader = LinearGradient(
                    cx, yTop, cx, yDrop + r,
                    intArrayOf(
                        Color.BLACK,
                        Color.parseColor("#343434"),
                        Color.parseColor("#909090"),
                        Color.WHITE
                    ),
                    floatArrayOf(0.0f, 0.28f, 0.65f, 1.0f),
                    Shader.TileMode.CLAMP
                )
                canvas.drawPath(path, neckPaint)
            }
        }

        // 3. Dynamic Island pílula preta no topo (desenhada por cima para absorver o droplet naturalmente!)
        val islandRect = RectF(
            cx - islandWidth / 2f,
            topOffset,
            cx + islandWidth / 2f,
            islandBottomY + islandStretch
        )
        canvas.drawRoundRect(islandRect, (islandHeight + islandStretch) / 2f, (islandHeight + islandStretch) / 2f, islandPaint)
    }

    private fun updateCardGeometry() {
        val params = cardView.layoutParams as LayoutParams
        params.width = Math.max(0, cardCurrentWidth.toInt())
        params.height = Math.max(0, cardCurrentHeight.toInt())
        params.topMargin = (dropletY - cardCurrentHeight / 2f).toInt()
        cardView.layoutParams = params

        (cardView.background as? GradientDrawable)?.cornerRadius = cardCurrentHeight / 2f
        cardContentLayout.alpha = contentOpacity
        invalidate()
    }

    // MARK: - Animação de Entrada
    private fun startEntranceAnimation() {
        dropletY = islandBottomY
        neckProgress = 1.0f
        islandStretch = 4f * density
        cardCurrentWidth = 54f * density
        cardCurrentHeight = 54f * density
        contentOpacity = 0.0f
        updateCardGeometry()

        // 1. Descida da gota líquida da ilha
        val dropAnim = ValueAnimator.ofFloat(islandBottomY, restingCenterY).apply {
            duration = 320
            interpolator = DecelerateInterpolator(1.2f)
            addUpdateListener {
                dropletY = it.animatedValue as Float
                islandStretch = 5f * density * (1f - it.animatedFraction)
                updateCardGeometry()
            }
        }

        // 2. Desprendimento rápido do pescoço
        postDelayed({
            val neckAnim = ValueAnimator.ofFloat(1.0f, 0.0f).apply {
                duration = 140
                addUpdateListener {
                    neckProgress = it.animatedValue as Float
                    invalidate()
                }
            }
            neckAnim.start()
        }, 180)

        // 3. Expansão horizontal da gota na cápsula branca
        postDelayed({
            val expandAnim = ValueAnimator.ofFloat(54f * density, targetCardWidth).apply {
                duration = 380
                interpolator = OvershootInterpolator(1.12f)
                addUpdateListener {
                    cardCurrentWidth = it.animatedValue as Float
                    cardCurrentHeight = targetCardHeight
                    updateCardGeometry()
                }
            }
            expandAnim.start()

            // 4. Fade in suave do conteúdo
            postDelayed({
                val contentAnim = ValueAnimator.ofFloat(0.0f, 1.0f).apply {
                    duration = 240
                    addUpdateListener {
                        contentOpacity = it.animatedValue as Float
                        cardContentLayout.alpha = contentOpacity
                    }
                }
                contentAnim.start()
            }, 140)
        }, 220)

        dropAnim.start()
    }

    // MARK: - Animação de Saída
    fun startDismissAnimation(onComplete: () -> Unit) {
        if (isDismissing) return
        isDismissing = true

        // 1. Fade out rápido do conteúdo
        val contentFade = ValueAnimator.ofFloat(contentOpacity, 0.0f).apply {
            duration = 120
            addUpdateListener {
                contentOpacity = it.animatedValue as Float
                cardContentLayout.alpha = contentOpacity
            }
        }
        contentFade.start()

        // 2. Colapso da cápsula de volta para o círculo
        postDelayed({
            val collapseAnim = ValueAnimator.ofFloat(cardCurrentWidth, 54f * density).apply {
                duration = 220
                interpolator = DecelerateInterpolator(1.4f)
                addUpdateListener {
                    cardCurrentWidth = it.animatedValue as Float
                    cardCurrentHeight = 54f * density
                    updateCardGeometry()
                }
            }
            collapseAnim.start()
        }, 80)

        // 3. Subida para a Dynamic Island, reconexão do pescoço e absorção elástica
        postDelayed({
            val ascendAnim = ValueAnimator.ofFloat(dropletY, islandBottomY + 4f * density).apply {
                duration = 260
                interpolator = DecelerateInterpolator(1.3f)
                addUpdateListener {
                    dropletY = it.animatedValue as Float
                    neckProgress = it.animatedFraction
                    islandStretch = 5f * density * it.animatedFraction
                    val frac = it.animatedFraction
                    if (frac > 0.6f) {
                        val shrinkFrac = (1f - frac) / 0.4f
                        cardCurrentWidth = 54f * density * shrinkFrac
                        cardCurrentHeight = 54f * density * shrinkFrac
                    }
                    updateCardGeometry()
                }
                addListener(object : AnimatorListenerAdapter() {
                    override fun onAnimationEnd(animation: Animator) {
                        val bounceAnim = ValueAnimator.ofFloat(5f * density, 0f).apply {
                            duration = 160
                            addUpdateListener {
                                islandStretch = it.animatedValue as Float
                                invalidate()
                            }
                        }
                        bounceAnim.start()

                        neckProgress = 0f
                        cardCurrentWidth = 0f
                        cardCurrentHeight = 0f
                        updateCardGeometry()
                        postDelayed({ onComplete() }, 170)
                    }
                })
            }
            ascendAnim.start()
        }, 220)
    }
}

// MARK: - Ícone Vetor person.badge.plus Nativo
class FollowBadgeIconView(context: Context) : View(context) {
    private val d = resources.displayMetrics.density

    private val bodyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#1C1C1E")
        style = Paint.Style.FILL
    }
    private val plusPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 1.8f * d
        strokeCap = Paint.Cap.ROUND
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f

        // Cabeça da pessoa
        canvas.drawCircle(cx - 3.5f * d, cy - 4.5f * d, 4.2f * d, bodyPaint)

        // Corpo / ombros
        val bodyRect = RectF(cx - 10.5f * d, cy + 1f * d, cx + 3.5f * d, cy + 12f * d)
        canvas.drawArc(bodyRect, 180f, 180f, true, bodyPaint)

        // Círculo com o distintivo de mais
        val badgeX = cx + 5.5f * d
        val badgeY = cy + 4.5f * d
        val badgeR = 6.2f * d
        canvas.drawCircle(badgeX, badgeY, badgeR, bodyPaint)

        // Sinal de +
        val p = 2.8f * d
        canvas.drawLine(badgeX - p, badgeY, badgeX + p, badgeY, plusPaint)
        canvas.drawLine(badgeX, badgeY - p, badgeX, badgeY + p, plusPaint)
    }
}
