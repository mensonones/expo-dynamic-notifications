import { ExpoDynamicNotificationsSwiftUIView, ExpoDynamicNotificationsComposeView } from 'expo-dynamic-notifications';
import { Host as SwiftUIHost, Text as SwiftUIText } from '@expo/ui/swift-ui';
import { padding, cornerRadius, background } from '@expo/ui/swift-ui/modifiers';
import { Host as ComposeHost, Text as ComposeText } from '@expo/ui/jetpack-compose';
import { paddingAll, background as composeBackground } from '@expo/ui/jetpack-compose/modifiers';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        {process.env.EXPO_OS === 'ios' && (
          <Group name="SwiftUI View">
            <SwiftUIHost style={styles.view}>
              <ExpoDynamicNotificationsSwiftUIView
                title="Hello from ExpoDynamicNotifications"
                modifiers={[padding({ all: 16 }), cornerRadius(12), background('#f0f0f0')]}>
                <SwiftUIText>Child content</SwiftUIText>
              </ExpoDynamicNotificationsSwiftUIView>
            </SwiftUIHost>
          </Group>
        )}
        {process.env.EXPO_OS === 'android' && (
          <Group name="Compose View">
            <ComposeHost style={styles.view}>
              <ExpoDynamicNotificationsComposeView
                title="Hello from ExpoDynamicNotifications"
                modifiers={[paddingAll(16), composeBackground('#f0f0f0')]}>
                <ComposeText>Child content</ComposeText>
              </ExpoDynamicNotificationsComposeView>
            </ComposeHost>
          </Group>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: { fontSize: 30, margin: 20 },
  groupHeader: { fontSize: 20, marginBottom: 20 },
  group: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  container: { flex: 1, backgroundColor: '#eee' },
  view: { flex: 1, height: 200 },
};
