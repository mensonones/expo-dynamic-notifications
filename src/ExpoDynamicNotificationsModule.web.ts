import { registerWebModule, NativeModule } from 'expo';

import { NativeNotificationPayload, NotificationEvents } from './ExpoDynamicNotifications.types';

class ExpoDynamicNotificationsModule extends NativeModule<NotificationEvents> {
  async showNotification(_payload: NativeNotificationPayload): Promise<void> {
    console.warn('ExpoDynamicNotifications is only supported on iOS and Android.');
  }

  async dismissNotification(): Promise<void> {}
}

export default registerWebModule(ExpoDynamicNotificationsModule, 'ExpoDynamicNotificationsModule');
