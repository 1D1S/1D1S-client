import { useSyncExternalStore } from 'react';

const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i;

export function isMobileUserAgent(ua: string | undefined | null): boolean {
  if (!ua) {
    return false;
  }
  return MOBILE_UA_REGEX.test(ua);
}

const subscribe = (): (() => void) => () => {};

function getClientSnapshot(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return isMobileUserAgent(navigator.userAgent);
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobileWebApp(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
