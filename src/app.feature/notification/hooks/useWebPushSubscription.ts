import { useCallback, useEffect, useState } from 'react';

import { notificationApi } from '../api/notificationApi';
import { useRegisterEndpoint } from './useNotificationMutations';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type WebPushStatus =
  | 'idle'
  | 'loading'
  | 'subscribed'
  | 'denied'
  | 'error';

export function useWebPushSubscription(): {
  status: WebPushStatus;
  subscribe(): Promise<void>;
} {
  const [status, setStatus] = useState<WebPushStatus>('idle');
  const { mutateAsync: registerEndpoint } = useRegisterEndpoint();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) { return; }
    navigator.serviceWorker.getRegistration('/sw.js').then((reg) => {
      if (!reg) { return; }
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) { setStatus('subscribed'); }
      });
    });
  }, []);

  const subscribe = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const { publicKey } = await notificationApi.getWebPushPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const raw = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await registerEndpoint({
        endpointUrl: raw.endpoint,
        p256dh: raw.keys.p256dh,
        authSecret: raw.keys.auth,
      });

      setStatus('subscribed');
    } catch {
      setStatus('error');
    }
  }, [registerEndpoint]);

  return { status, subscribe };
}
