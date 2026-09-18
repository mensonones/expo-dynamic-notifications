// Reexport the native module. On web, it will be resolved to ExpoDynamicNotificationsModule.web.ts
// and on native platforms to ExpoDynamicNotificationsModule.ts
export { default } from './ExpoDynamicNotificationsModule';
export { default as ExpoDynamicNotificationsSwiftUIView } from './ExpoDynamicNotificationsSwiftUIView';
export { default as ExpoDynamicNotificationsComposeView } from './ExpoDynamicNotificationsComposeView';
export * from './ExpoDynamicNotifications.types';
