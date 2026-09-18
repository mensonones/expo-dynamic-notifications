import SwiftUI
import ExpoModulesCore
import ExpoUI

final class ExpoDynamicNotificationsSwiftUIViewProps: UIBaseViewProps {
  @Field var title: String = ""
}

struct ExpoDynamicNotificationsSwiftUIView: ExpoSwiftUI.View {
  @ObservedObject public var props: ExpoDynamicNotificationsSwiftUIViewProps

  var body: some View {
    VStack {
      Text(props.title)
        .font(.headline)
      Children()
    }
  }
}
