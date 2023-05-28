import { UserEntity } from '@app/user/user.entity';
import { Request } from 'express';

export interface IExpressReq extends Request {
  user?: UserEntity;
}
