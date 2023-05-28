import { UserEntity } from '@app/user/user.entity';

export type TUser = Omit<UserEntity, 'hashPassword' | 'password'>;
