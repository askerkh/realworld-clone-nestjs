import { TUser } from '@app/user/types/user.type';

export type TProfile = TUser & {
  following: boolean;
};
