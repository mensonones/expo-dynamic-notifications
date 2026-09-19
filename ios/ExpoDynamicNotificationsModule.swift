import ExpoModulesCore

public class ExpoDynamicNotificationsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDynamicNotifications")

    Events("onNotificationPress", "onNotificationDismiss")

    AsyncFunction("showNotification") { (payload: [String: Any]) in
      await MainActor.run {
        DynamicIslandOverlayController.shared.show(
          payload: payload,
          onPress: { [weak self] in
            self?.sendEvent("onNotificationPress")
          },
          onDismiss: { [weak self] in
            self?.sendEvent("onNotificationDismiss")
          }
        )
      }
    }

    AsyncFunction("dismissNotification") {
      await MainActor.run {
        DynamicIslandOverlayController.shared.dismiss()
      }
    }
  }
}
