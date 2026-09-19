# expo-dynamic-notifications

Native, fluid Dynamic Island and floating overlay notifications for **Expo** and **React Native** (iOS & Android).

Designed to mimic iOS Dynamic Island interactions with spring physics, haptic feedback, avatar image support, SF Symbols, custom accent colors, and swipe-to-dismiss gestures.

<p align="center">
  <img src="./assets/demo.gif" width="340" alt="expo-dynamic-notifications demo" />
</p>

---

## Features

- 🏝️ **Dynamic Island Physics on iOS**: Native SwiftUI overlay attached to the top window with spring animations and haptic feedback.
- 🤖 **Native Android Floating Overlay**: Smooth overshoot animations with status bar inset handling and swipe gestures.
- 🎨 **Rich Content**: Avatars (network URLs), SF Symbols / vector icons, title, subtitle, and right action badges.
- 🌗 **Light & Dark Themes**: Configurable themes with modern frosted glass / pill aesthetics.
- 👆 **Interactive Callbacks**: Native press and dismiss event listeners (`onPress`, `onDismiss`).
- ⚡ **Simple API**: `trigger()`, `dismiss()`, and `useDynamicNotifications()` React hook.

---

## Installation

```bash
npx expo install expo-dynamic-notifications
```

*Or with Bun:*

```bash
bun add expo-dynamic-notifications
```

> **Note**: This is a native Expo module. It requires a custom development client (`npx expo run:ios` or `npx expo run:android`) and is not supported in Expo Go.

---

## Usage

### Imperative API

```tsx
import { trigger, dismiss } from 'expo-dynamic-notifications';

// Trigger a notification
await trigger({
  title: 'Felix Schneider',
  message: 'Sent you a photo',
  avatarUrl: 'https://images.unsplash.com/...',
  symbolName: 'photo.fill',
  accentColor: '#007AFF',
  duration: 4000, // Duration in ms (set to null or 0 to keep visible until dismissed)
  theme: 'light',
  onPress: () => {
    console.log('Notification tapped!');
  },
  onDismiss: () => {
    console.log('Notification closed');
  },
});

// Dismiss manually
await dismiss();
```

### React Hook

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useDynamicNotifications } from 'expo-dynamic-notifications';

export default function MyComponent() {
  const { trigger, dismiss } = useDynamicNotifications();

  const handleShow = () => {
    trigger({
      title: 'Incoming Call',
      message: 'Mobile +1 555 019 283',
      symbolName: 'phone.fill',
      accentColor: '#34C759',
      duration: 5000,
      onPress: () => console.log('Answer call'),
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Show Notification" onPress={handleShow} />
      <Button title="Dismiss" onPress={dismiss} color="#FF3B30" />
    </View>
  );
}
```

---

## API Reference

### `NotificationPayload`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | *(Required)* | Main title text displayed in bold. |
| `message` | `string` | `undefined` | Subtitle / description message. |
| `avatarUrl` | `string` | `undefined` | Remote image URL or local file path for circular avatar. |
| `symbolName` | `string` | `undefined` | SF Symbol icon name (iOS) or icon badge. |
| `accentColor` | `string` | `'#007AFF'` | Hex color for the icon badge / accent highlights. |
| `duration` | `number \| null` | `3500` | Auto-dismiss duration in ms. Pass `null` or `0` for persistent notifications. |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme style of the notification capsule. |
| `rightSymbolName` | `string` | `undefined` | Optional symbol name for the right-hand action indicator. |
| `titleColor` | `string` | `undefined` | Custom hex color for the title text. |
| `messageColor` | `string` | `undefined` | Custom hex color for the message text. |
| `onPress` | `() => void` | `undefined` | Callback invoked when the user taps the notification. |
| `onDismiss` | `() => void` | `undefined` | Callback invoked when the notification disappears or is swiped away. |

---

## Example App

Check out the interactive example project in [`example/`](./example):

```bash
cd example
bun install
bun run ios
# or
bun run android
```

---

## License

MIT © [Emerson Vieira](https://github.com/mensonones)
