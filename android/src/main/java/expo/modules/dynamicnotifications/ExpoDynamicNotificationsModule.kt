package expo.modules.dynamicnotifications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoDynamicNotificationsModule : Module() {
  private var overlay: DynamicIslandOverlayAndroid? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoDynamicNotifications")

    Events("onNotificationPress", "onNotificationDismiss")

    AsyncFunction("showNotification") { payload: Map<String, Any?> ->
      val activity = appContext.currentActivity ?: return@AsyncFunction
      if (overlay == null) {
        overlay = DynamicIslandOverlayAndroid(activity)
      }
      overlay?.show(
        payload = payload,
        onPress = {
          sendEvent("onNotificationPress")
        },
        onDismiss = {
          sendEvent("onNotificationDismiss")
        }
      )
    }

    AsyncFunction("dismissNotification") {
      overlay?.dismissCurrent(animate = true) {
        sendEvent("onNotificationDismiss")
      }
    }
  }
}
