/**
 * DTO를 꼭 만들지 않아도 됩니다.
 * CodeGen으로 타입이 생성이 되면 해당 타입을 사용해도 됩니다.
 * 
 * DTO를 만들지 안만들지에 대해서는 논의가 필요합니다.
 * 스키마가 자주 변경되는 경우 프론트 만의 DTO를 만드는 것이 좋습니다.
 * 하지만 DTO를 만들면 코드가 길어지고 관리해야 할 코드가 많아집니다.
 */

export interface UserDTO {
  id: string;
  email: string;
  name: string;
}
