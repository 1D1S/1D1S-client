import { describe, expect, it } from 'vitest';

import { isSafeHttpUrl } from './chatShareLink';

describe('isSafeHttpUrl', () => {
  it.each([
    ['https://1day1streak.com', true],
    ['http://example.com/a?b=1', true],
    ['javascript:alert(1)', false],
    ['JavaScript:alert(1)', false],
    ['data:text/html,<script>alert(1)</script>', false],
    ['vbscript:msgbox(1)', false],
    ['/relative/path', false],
    ['example.com', false],
    ['', false],
    [undefined, false],
    [null, false],
  ])('%s -> %s', (value, expected) => {
    expect(isSafeHttpUrl(value)).toBe(expected);
  });
});
