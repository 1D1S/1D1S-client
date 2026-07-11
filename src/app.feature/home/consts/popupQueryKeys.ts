export const POPUP_QUERY_KEYS = {
  all: ['popups'] as const,
  active: () => [...POPUP_QUERY_KEYS.all, 'active'] as const,
};
