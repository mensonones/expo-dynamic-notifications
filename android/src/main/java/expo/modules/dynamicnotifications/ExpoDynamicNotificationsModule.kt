package expo.modules.dynamicnotifications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView

class ExpoDynamicNotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoDynamicNotifications")

    ExpoUIView<ExpoDynamicNotificationsComposeViewProps>("ExpoDynamicNotificationsComposeView") {
      Content { props ->
        ExpoDynamicNotificationsComposeViewContent(props)
      }
    }
  }
}
