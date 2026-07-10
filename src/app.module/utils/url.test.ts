import { describe, expect, it } from 'vitest';

import { trimTrailingSlash } from './url';

describe('trimTrailingSlash', () => {
  it('removes a single trailing slash', () => {
    expect(trimTrailingSlash('https://a.com/')).toBe('https://a.com');
  });

  it('removes multiple trailing slashes', () => {
    expect(trimTrailingSlash('https://a.com///')).toBe('https://a.com');
  });

  it('leaves a url without a trailing slash unchanged', () => {
    expect(trimTrailingSlash('https://a.com/path')).toBe('https://a.com/path');
  });

  it('returns an empty string unchanged', () => {
    expect(trimTrailingSlash('')).toBe('');
  });
});
