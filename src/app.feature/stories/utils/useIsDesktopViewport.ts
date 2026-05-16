'use client';

import { useSyncExternalStore } from 'react';

// Tailwind `lg` 브레이크포인트와 동일.
const DESKTOP_MIN_WIDTH = 1024;
const MEDIA_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getClientSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsDesktopViewport(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
