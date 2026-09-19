import { type CommonViewModifierProps } from '@expo/ui/swift-ui';
import { createViewModifierEventListener } from '@expo/ui/swift-ui/modifiers';
import { requireNativeView } from 'expo';
import * as React from 'react';

export interface ExpoDynamicNotificationsSwiftUIViewProps extends CommonViewModifierProps {
  title: string;
  children?: React.ReactNode;
}

const NativeExpoDynamicNotificationsSwiftUIView =
  requireNativeView<ExpoDynamicNotificationsSwiftUIViewProps>(
    'ExpoDynamicNotifications',
    'ExpoDynamicNotificationsSwiftUIView'
  );

export default function ExpoDynamicNotificationsSwiftUIView({
  modifiers,
  ...rest
}: ExpoDynamicNotificationsSwiftUIViewProps) {
  return (
    <NativeExpoDynamicNotificationsSwiftUIView
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      {...rest}
    />
  );
}
