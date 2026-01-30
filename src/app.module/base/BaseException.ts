export class BaseException extends Error {
  msgForDev: string;
  msgForUser: string;

  constructor(msgForDev: string, msgForUser: string) {
    super(msgForDev);
    this.name = this.constructor.name;
    this.msgForDev = msgForDev;
    this.msgForUser = msgForUser;
  }
}
