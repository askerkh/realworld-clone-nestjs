import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@app/user/decorators/user.decorator';
import { IProfileRes } from './types/profileRes.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') userId: number,
    @Param('username') profileUsername: string,
  ): Promise<IProfileRes> {
    const profile = await this.profileService.getProfile(
      userId,
      profileUsername,
    );

    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followOnUser(
    @User('id') userId: number,
    @Param('username') profileUsername: string,
  ) {
    const profile = await this.profileService.followProfile(
      userId,
      profileUsername,
    );

    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowFromUser(
    @User('id') userId: number,
    @Param('username') profileUsername: string,
  ) {
    const profile = await this.profileService.unfollowProfile(
      userId,
      profileUsername,
    );

    return this.profileService.buildProfileResponse(profile);
  }
}
