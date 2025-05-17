export abstract class BaseException extends Error {
  /** 사용자에게 보여줄 메시지 */
  readonly msgForUser: string;

  constructor(msgForDev: string, msgForUser: string) {
    super(msgForDev);
    this.msgForUser = msgForUser;
    // 프로토타입 체이닝을 위해 다음 설정
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
