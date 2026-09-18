import { registerWebModule, NativeModule } from 'expo';

// ExpoDynamicNotificationsModule is not available on the web platform.
class ExpoDynamicNotificationsModule extends NativeModule<{}> {}

export default registerWebModule(ExpoDynamicNotificationsModule, 'ExpoDynamicNotificationsModule');
