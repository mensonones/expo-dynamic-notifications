import ExpoModulesCore
import ExpoUI

public class ExpoDynamicNotificationsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoDynamicNotifications")

    ExpoUIView(ExpoDynamicNotificationsSwiftUIView.self)
  }
}
