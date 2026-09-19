import { type PrimitiveBaseProps } from '@expo/ui/jetpack-compose';
import { createViewModifierEventListener } from '@expo/ui/jetpack-compose/modifiers';
import { requireNativeView } from 'expo';
import * as React from 'react';

export interface ExpoDynamicNotificationsComposeViewProps extends PrimitiveBaseProps {
  title: string;
  children?: React.ReactNode;
}

const NativeExpoDynamicNotificationsComposeView =
  requireNativeView<ExpoDynamicNotificationsComposeViewProps>(
    'ExpoDynamicNotifications',
    'ExpoDynamicNotificationsComposeView'
  );

export default function ExpoDynamicNotificationsComposeView({
  modifiers,
  ...rest
}: ExpoDynamicNotificationsComposeViewProps) {
  return (
    <NativeExpoDynamicNotificationsComposeView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
