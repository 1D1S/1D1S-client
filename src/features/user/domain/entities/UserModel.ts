/** 예시 도메인 모델입니다.*/
export class UserModel {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _name: string,
    private readonly _createdAt: Date
  ) {}

  // Factory: 새 사용자 생성
  static create(params: { id: string; email: string; name: string; createdAt?: Date }): UserModel {
    const { id, email, name, createdAt } = params;

    const emailVo = email;

    return new UserModel(id, emailVo, name.trim(), createdAt ?? new Date());
  }

  // Persistence에서 로드할 때
  static fromPersistence(record: {
    id: string;
    email: string;
    name: string;
    createdAt: string | Date;
  }): UserModel {
    const emailVo = record.email;
    const created =
      record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt);
    return new UserModel(record.id, emailVo, record.name, created);
  }

  // 엔터티 ID
  get id(): string {
    return this._id;
  }

  // 이메일 조회
  get email(): string {
    return this._email;
  }

  // 이름 조회
  get name(): string {
    return this._name;
  }

  // 생성일 조회
  get createdAt(): Date {
    return this._createdAt;
  }

  // 이메일 변경 도메인 행위
  changeEmail(newEmail: string): void {
    const emailVo = newEmail;
    this._email = emailVo;
  }

  // 이름 변경 도메인 행위
  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      return;
    }
    this._name = newName.trim();
  }

  // 엔터티 동등성: ID 비교
  equals(other: UserModel): boolean {
    return this._id === other._id;
  }

  // Persistence 변환
  toPersistence(): {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  } {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
