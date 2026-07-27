// 네이티브 신고 모달이 돌려준 결과 파싱. 신버전 앱은 JSON 문자열
//   {"reportType":"<value>","content":"<상세내용>"}
// 을 주고, report 페이로드를 모르는 구버전 앱은 buttons 폴백으로 사유 value
// 문자열만 준다. 두 경우 모두 안전하게 다루고, 사유가 목록에 없거나 상세가
// 필수인데 비었으면 null(제출 불가 → 취소)로 반환한다.
export interface NativeReportResult {
  reportType: string;
  content: string;
}

export function parseNativeReportResult(
  value: string | null,
  validTypes: readonly string[],
  requiredFor: readonly string[]
): NativeReportResult | null {
  if (!value || value === 'cancel') {
    return null;
  }

  // 신버전 앱: JSON.
  try {
    const raw: unknown = JSON.parse(value);
    if (raw && typeof raw === 'object') {
      const record = raw as Record<string, unknown>;
      const reportType =
        typeof record.reportType === 'string' ? record.reportType : '';
      const content =
        typeof record.content === 'string' ? record.content.trim() : '';
      if (!validTypes.includes(reportType)) {
        return null;
      }
      if (requiredFor.includes(reportType) && !content) {
        return null;
      }
      return { reportType, content };
    }
  } catch {
    // JSON 아님 → 구버전 버튼 폴백으로 처리.
  }

  // 구버전 앱: 사유 value 문자열만. 상세 입력이 없으므로 상세 필수 사유는
  // 제출할 수 없다(취소로 처리).
  if (validTypes.includes(value) && !requiredFor.includes(value)) {
    return { reportType: value, content: '' };
  }
  return null;
}
