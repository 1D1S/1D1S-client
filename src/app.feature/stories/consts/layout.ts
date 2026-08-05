/**
 * 스토리 가로 스크롤러를 화면 끝까지 흘리기 위한 full-bleed 클래스.
 *
 * 홈 컨테이너(HomeScreen)의 좌우 패딩(px-5 / lg:px-8)을 음수 마진으로 상쇄하고
 * 같은 값을 스크롤 영역 안쪽 패딩으로 되돌린다. 첫/마지막 카드의 여백은 그대로
 * 유지되면서, 스크롤한 카드는 패딩 경계가 아니라 화면 가장자리에서 사라진다.
 * (패딩을 부모에만 두면 카드가 여백 선에서 잘려 보였다 — 실제 QA 증상)
 *
 * HomeScreen 의 패딩을 바꾸면 이 값도 같이 바꿔야 한다.
 *
 * ⚠️ 이 클래스를 쓰는 스크롤 컨테이너에 `w-full` 을 붙이지 말 것.
 * box-sizing:border-box 에서 width:100% 는 border-box 를 부모 content 폭(= 화면폭
 * − 2×패딩)으로 고정한다. 음수 마진은 왼쪽만 당길 뿐 폭을 넓히지 못해 오른쪽이
 * 2×패딩만큼 짧아져 마지막 카드가 잘렸다(실제 QA 증상). width 를 auto 로 두면
 * 음수 마진에 맞춰 border-box 가 화면폭까지 확장돼 edge-to-edge full-bleed 가 된다.
 */
export const STORY_RAIL_BLEED = '-mx-5 px-5 lg:-mx-8 lg:px-8';
