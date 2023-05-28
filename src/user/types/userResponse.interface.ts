import { TUser } from '@app/user/types/user.type';

export interface IUserResponse {
  user: TUser & { token: string };
}
