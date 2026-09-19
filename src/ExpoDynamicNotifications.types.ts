export interface NotificationPayload {
  /**
   * Title text displayed in the notification.
   */
  title: string;

  /**
   * Subtitle / description message.
   */
  message?: string;

  /**
   * Image URL for avatar/icon (e.g. https://... or file://...).
   */
  avatarUrl?: string;

  /**
   * SF Symbol name on iOS (e.g. 'bell.fill', 'heart.fill', 'music.note').
   */
  symbolName?: string;

  /**
   * Accent hex color (e.g. '#2F9BFF' or '#34C759').
   */
  accentColor?: string;

  /**
   * Duration in milliseconds before auto-dismissing.
   * Set to `null` or `0` to keep the notification visible until swiped or manually dismissed.
   * @default 3500
   */
  duration?: number | null;

  /**
   * Theme of the notification card.
   * Defaults to 'light' to match the dynamic island drop card design.
   * @default 'light'
   */
  theme?: 'light' | 'dark';

  /**
   * Optional right action symbol / icon (e.g. 'person.badge.plus', 'chevron.right').
   */
  rightSymbolName?: string;

  /**
   * Custom title text color (hex).
   */
  titleColor?: string;

  /**
   * Custom message text color (hex).
   */
  messageColor?: string;

  /**
   * Callback executed when the user taps on the notification.
   */
  onPress?: () => void;

  /**
   * Callback executed when the notification is dismissed.
   */
  onDismiss?: () => void;
}

export type NativeNotificationPayload = Omit<NotificationPayload, 'onPress' | 'onDismiss'>;

export type NotificationEvents = {
  onNotificationPress: () => void;
  onNotificationDismiss: () => void;
  [key: string]: any;
};
