package expo.modules.dynamicnotifications

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry

data class ExpoDynamicNotificationsComposeViewProps(
  @Field val title: String = "",
  @Field val modifiers: ModifierList = emptyList()
) : ComposeProps

@Composable
fun FunctionalComposableScope.ExpoDynamicNotificationsComposeViewContent(props: ExpoDynamicNotificationsComposeViewProps) {
  Column(
    modifier = ModifierRegistry.applyModifiers(
      props.modifiers,
      appContext,
      composableScope,
      globalEventDispatcher
    )
  ) {
    Text(props.title)
    Children(composableScope)
  }
}
