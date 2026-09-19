import { useCallback } from 'react';

import { NotificationPayload } from './ExpoDynamicNotifications.types';
import ExpoDynamicNotificationsModule from './ExpoDynamicNotificationsModule';

let activeOnPress: (() => void) | undefined;
let activeOnDismiss: (() => void) | undefined;

// Listeners para os eventos nativos do módulo
ExpoDynamicNotificationsModule.addListener('onNotificationPress', () => {
  activeOnPress?.();
});

ExpoDynamicNotificationsModule.addListener('onNotificationDismiss', () => {
  activeOnDismiss?.();
  activeOnPress = undefined;
  activeOnDismiss = undefined;
});

/**
 * Exibe a notificação dinâmica no topo da tela com física e animação nativa.
 */
export async function trigger(payload: NotificationPayload): Promise<void> {
  activeOnPress = payload.onPress;
  activeOnDismiss = payload.onDismiss;

  const { onPress, onDismiss, ...nativePayload } = payload;
  await ExpoDynamicNotificationsModule.showNotification({
    ...nativePayload,
    duration: payload.duration !== undefined ? payload.duration : 3500,
  });
}

/**
 * Fecha a notificação dinâmica ativa.
 */
export async function dismiss(): Promise<void> {
  await ExpoDynamicNotificationsModule.dismissNotification();
}

/**
 * Hook React para controlar notificações dinâmicas.
 */
export function useDynamicNotifications() {
  const triggerNotification = useCallback((payload: NotificationPayload) => {
    return trigger(payload);
  }, []);

  const dismissNotification = useCallback(() => {
    return dismiss();
  }, []);

  return {
    trigger: triggerNotification,
    dismiss: dismissNotification,
  };
}

export { default } from './ExpoDynamicNotificationsModule';
export * from './ExpoDynamicNotifications.types';
