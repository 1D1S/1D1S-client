/** 태그를 걷어낸 실제 글자가 있는가. */
export function hasHtmlText(html?: string | null): boolean {
  if (!html) {
    return false;
  }
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}
