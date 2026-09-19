import SwiftUI

// MARK: - View Model
@MainActor
public class DynamicIslandNotificationViewModel: ObservableObject {
    @Published public var title: String = ""
    @Published public var message: String? = nil
    @Published public var avatarUrl: String? = nil
    @Published public var symbolName: String? = nil
    @Published public var rightSymbolName: String = "person.badge.plus"
    @Published public var accentColorHex: String? = nil
    @Published public var theme: String = "light"
    @Published public var titleColorHex: String? = nil
    @Published public var messageColorHex: String? = nil
    @Published public var isVisible: Bool = false
    @Published public var isDismissing: Bool = false

    public var onPress: (() -> Void)?
    public var onDismissCompleted: (() -> Void)?

    public init() {}

    public func configure(
        payload: [String: Any],
        onPress: @escaping () -> Void,
        onDismissCompleted: @escaping () -> Void
    ) {
        self.title = payload["title"] as? String ?? ""
        self.message = payload["message"] as? String
        self.avatarUrl = payload["avatarUrl"] as? String
        self.symbolName = payload["symbolName"] as? String
        self.rightSymbolName = payload["rightSymbolName"] as? String ?? "person.badge.plus"
        self.accentColorHex = payload["accentColor"] as? String
        self.theme = payload["theme"] as? String ?? "light"
        self.titleColorHex = payload["titleColor"] as? String
        self.messageColorHex = payload["messageColor"] as? String
        self.onPress = onPress
        self.onDismissCompleted = onDismissCompleted
        self.isDismissing = false
        self.isVisible = true
    }

    public func triggerDismiss() {
        guard isVisible, !isDismissing else { return }
        isDismissing = true
    }
}

// MARK: - Fluid Droplet Neck Shape
struct FluidNeckShape: Shape {
    var dropletCenterY: CGFloat
    var dropletRadius: CGFloat
    var islandBottomY: CGFloat
    var neckProgress: CGFloat

    var animatableData: AnimatablePair<CGFloat, AnimatablePair<CGFloat, CGFloat>> {
        get { AnimatablePair(dropletCenterY, AnimatablePair(neckProgress, dropletRadius)) }
        set {
            dropletCenterY = newValue.first
            neckProgress = newValue.second.first
            dropletRadius = newValue.second.second
        }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        guard neckProgress > 0.02 else { return path }

        let centerX = rect.midX
        let wTop = 84.0 * neckProgress
        let wNeck = max(10.0, 32.0 * neckProgress)
        let r = dropletRadius
        let yTop = islandBottomY
        let yDrop = dropletCenterY

        guard yDrop > yTop else { return path }

        path.move(to: CGPoint(x: centerX - wTop / 2, y: yTop))

        path.addCurve(
            to: CGPoint(x: centerX - r, y: yDrop),
            control1: CGPoint(x: centerX - wNeck / 2 - 4, y: yTop + (yDrop - yTop) * 0.42),
            control2: CGPoint(x: centerX - r - 2, y: yDrop - r * 0.55)
        )

        path.addArc(
            center: CGPoint(x: centerX, y: yDrop),
            radius: r,
            startAngle: .degrees(180),
            endAngle: .degrees(0),
            clockwise: true
        )

        path.addCurve(
            to: CGPoint(x: centerX + wTop / 2, y: yTop),
            control1: CGPoint(x: centerX + r + 2, y: yDrop - r * 0.55),
            control2: CGPoint(x: centerX + wNeck / 2 + 4, y: yTop + (yDrop - yTop) * 0.42)
        )

        path.closeSubpath()
        return path
    }
}

// MARK: - Main Container View
public struct DynamicIslandNotificationContainerView: View {
    @ObservedObject var viewModel: DynamicIslandNotificationViewModel

    // Geometria da Dynamic Island nativa
    private let islandWidth: CGFloat = 126
    private let islandHeight: CGFloat = 37
    private let topOffset: CGFloat = 11
    private var islandBottomY: CGFloat { topOffset + islandHeight }

    // Medidas 1:1 calculadas a partir do vídeo
    private let cardGapFromIsland: CGFloat = 32
    private let targetCardHeight: CGFloat = 74
    private var targetCardTop: CGFloat { islandBottomY + cardGapFromIsland }
    private var restingCenterY: CGFloat { targetCardTop + targetCardHeight / 2 }

    private var targetCardWidth: CGFloat {
        let screenWidth = UIScreen.main.bounds.width
        return min(screenWidth - 32, 408)
    }

    // Estados da animação física
    @State private var dropletY: CGFloat = 48
    @State private var neckProgress: CGFloat = 0.0
    @State private var dropletRadius: CGFloat = 27
    @State private var cardWidth: CGFloat = 54
    @State private var cardHeight: CGFloat = 54
    @State private var contentOpacity: Double = 0.0
    @State private var islandStretch: CGFloat = 0.0
    @State private var dragOffset: CGFloat = 0.0

    private var isLightTheme: Bool {
        viewModel.theme != "dark"
    }

    private var cardBgColor: Color {
        isLightTheme ? Color.white : Color(hex: "#1C1D24")
    }

    private var titleColor: Color {
        if let hex = viewModel.titleColorHex {
            return Color(hex: hex)
        }
        return isLightTheme ? Color(hex: "#111111") : Color.white
    }

    private var messageColor: Color {
        if let hex = viewModel.messageColorHex {
            return Color(hex: hex)
        }
        return isLightTheme ? Color(hex: "#7E8085") : Color(hex: "#A0A0A5")
    }

    private var rightIconColor: Color {
        isLightTheme ? Color(hex: "#1C1C1E") : Color(white: 0.9)
    }

    private var accentColor: Color {
        if let hex = viewModel.accentColorHex {
            return Color(hex: hex)
        }
        return Color(hex: "#2F9BFF")
    }

    public init(viewModel: DynamicIslandNotificationViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack(alignment: .top) {
            // 1. Dynamic Island Base (Pílula preta no topo)
            RoundedRectangle(cornerRadius: (islandHeight + islandStretch) / 2)
                .fill(Color.black)
                .frame(width: islandWidth, height: islandHeight + islandStretch)
                .offset(y: topOffset)

            // 2. Pescoço líquido em gradiente conectando a Ilha à Gota
            if neckProgress > 0.01 {
                FluidNeckShape(
                    dropletCenterY: dropletY,
                    dropletRadius: dropletRadius,
                    islandBottomY: islandBottomY + islandStretch,
                    neckProgress: neckProgress
                )
                .fill(
                    LinearGradient(
                        stops: [
                            .init(color: .black, location: 0.0),
                            .init(color: Color(white: 0.22), location: 0.28),
                            .init(color: Color(white: 0.65), location: 0.62),
                            .init(color: cardBgColor, location: 0.95)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            }

            // 3. Card Cápsula / Gota
            ZStack {
                RoundedRectangle(cornerRadius: cardHeight / 2)
                    .fill(cardBgColor)
                    .overlay(
                        RoundedRectangle(cornerRadius: cardHeight / 2)
                            .stroke(isLightTheme ? Color.black.opacity(0.04) : Color.white.opacity(0.12), lineWidth: 0.5)
                    )
                    .shadow(
                        color: Color.black.opacity(isLightTheme ? 0.08 : 0.4),
                        radius: 16,
                        x: 0,
                        y: 8
                    )
                    .shadow(
                        color: Color.black.opacity(isLightTheme ? 0.03 : 0.2),
                        radius: 4,
                        x: 0,
                        y: 2
                    )

                if cardWidth > 180 {
                    HStack(spacing: 14) {
                        // Avatar circular à esquerda
                        if let avatarUrl = viewModel.avatarUrl, let url = URL(string: avatarUrl) {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .success(let image):
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                case .failure(_):
                                    defaultAvatarView
                                case .empty:
                                    Color(white: 0.88)
                                @unknown default:
                                    defaultAvatarView
                                }
                            }
                            .frame(width: 48, height: 48)
                            .clipShape(Circle())
                        } else {
                            defaultAvatarView
                        }

                        // Textos centralizados à esquerda
                        VStack(alignment: .leading, spacing: 3) {
                            Text(viewModel.title)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(titleColor)
                                .lineLimit(1)

                            if let message = viewModel.message, !message.isEmpty {
                                Text(message)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(messageColor)
                                    .lineLimit(1)
                            }
                        }

                        Spacer()

                        // Ícone de ação à direita (person.badge.plus)
                        Image(systemName: viewModel.rightSymbolName)
                            .font(.system(size: 21, weight: .semibold))
                            .foregroundColor(rightIconColor)
                            .padding(.trailing, 6)
                    }
                    .padding(.horizontal, 16)
                    .opacity(contentOpacity)
                }
            }
            .frame(width: cardWidth, height: cardHeight)
            .position(x: UIScreen.main.bounds.width / 2, y: dropletY)
            .offset(y: dragOffset)
            .onTapGesture {
                viewModel.onPress?()
            }
            .gesture(
                DragGesture()
                    .onChanged { value in
                        if value.translation.height < 0 {
                            dragOffset = value.translation.height
                        }
                    }
                    .onEnded { value in
                        if value.translation.height < -18 {
                            startDismissAnimation()
                        } else {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                                dragOffset = 0
                            }
                        }
                    }
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .onAppear {
            startEntranceAnimation()
        }
        .onChange(of: viewModel.isDismissing) { isDismissing in
            if isDismissing {
                startDismissAnimation()
            }
        }
    }

    private var defaultAvatarView: some View {
        Group {
            if let symbolName = viewModel.symbolName, !symbolName.isEmpty {
                Image(systemName: symbolName)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundColor(accentColor)
                    .frame(width: 48, height: 48)
                    .background(accentColor.opacity(0.14))
                    .clipShape(Circle())
            } else {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(Color(white: 0.8))
                    .frame(width: 48, height: 48)
            }
        }
    }

    // MARK: - Animação de Entrada
    private func startEntranceAnimation() {
        dropletY = islandBottomY
        neckProgress = 1.0
        islandStretch = 4.0
        cardWidth = 54
        cardHeight = 54
        dropletRadius = 27
        contentOpacity = 0.0

        // 1. Gota desce da ilha
        withAnimation(.spring(response: 0.38, dampingFraction: 0.7)) {
            dropletY = restingCenterY
            islandStretch = 6.0
        }

        // 2. Desprendimento suave do pescoço
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.20) {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.85)) {
                neckProgress = 0.0
                islandStretch = 0.0
            }
        }

        // 3. Expansão horizontal da pílula
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.24) {
            withAnimation(.spring(response: 0.44, dampingFraction: 0.74)) {
                cardWidth = targetCardWidth
                cardHeight = targetCardHeight
            }
        }

        // 4. Fade in suave do conteúdo do card
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.38) {
            withAnimation(.easeOut(duration: 0.24)) {
                contentOpacity = 1.0
            }
        }
    }

    // MARK: - Animação de Saída
    private func startDismissAnimation() {
        // 1. Fade out rápido do conteúdo
        withAnimation(.easeIn(duration: 0.12)) {
            contentOpacity = 0.0
        }

        // 2. Colapso horizontal da pílula de volta para a gota circular
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) {
                cardWidth = 54
                cardHeight = 54
            }
        }

        // 3. A gota sobe em direção à ilha e o pescoço líquido reaparece
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.24) {
            withAnimation(.spring(response: 0.34, dampingFraction: 0.78)) {
                dropletY = islandBottomY + 2
                neckProgress = 1.0
                islandStretch = 5.0
            }
        }

        // 4. Absorção completa da gota e rebote elástico da ilha
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.42) {
            withAnimation(.spring(response: 0.28, dampingFraction: 0.7)) {
                neckProgress = 0.0
                islandStretch = 0.0
                cardWidth = 0
                cardHeight = 0
            }
        }

        // 5. Finalização e notificação ao controller
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.54) {
            viewModel.onDismissCompleted?()
        }
    }
}

// MARK: - Extensão para Hex Color
extension Color {
    init(hex: String) {
        let cleanHex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleanHex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch cleanHex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 122, 255)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
