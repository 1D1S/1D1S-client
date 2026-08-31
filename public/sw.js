// 웹 푸시를 제거해서 이 서비스워커는 더 이상 하는 일이 없다. 파일을 지우면
// 이미 설치된 구버전이 404 로 갱신에 실패해 그대로 남고 계속 푸시를 띄우므로,
// 스스로 등록을 해제하는 스텁만 남긴다(구독도 함께 정리된다).
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
