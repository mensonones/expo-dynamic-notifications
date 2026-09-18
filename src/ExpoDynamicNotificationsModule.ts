import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoDynamicNotificationsModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoDynamicNotificationsModule>('ExpoDynamicNotifications');
