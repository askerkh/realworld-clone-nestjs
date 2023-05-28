import { IExpressReq } from '@app/types/expressReq.interface';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TUser } from '@app/user/types/user.type';

export const User = createParamDecorator(
  (data: keyof TUser, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<IExpressReq>();

    if (!user) {
      return null;
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
