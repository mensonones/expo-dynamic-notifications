import { NativeModule, requireNativeModule } from 'expo';

import { NativeNotificationPayload, NotificationEvents } from './ExpoDynamicNotifications.types';

declare class ExpoDynamicNotificationsModule extends NativeModule<NotificationEvents> {
  showNotification(payload: NativeNotificationPayload): Promise<void>;
  dismissNotification(): Promise<void>;
}

export default requireNativeModule<ExpoDynamicNotificationsModule>('ExpoDynamicNotifications');
