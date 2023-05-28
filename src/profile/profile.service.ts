import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TProfile } from './types/profile.type';
import { IProfileRes } from './types/profileRes.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}

  async getProfile(userId: number, profileUsername: string): Promise<TProfile> {
    const user = await this.userRepo.findOneBy({ username: profileUsername });

    if (!user) {
      throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepo.findOneBy({
      followerId: userId,
      followingId: user.id,
    });

    return {
      ...user,
      following: Boolean(follow),
    };
  }

  async followProfile(
    userId: number,
    profileUsername: string,
  ): Promise<TProfile> {
    const user = await this.userRepo.findOneBy({ username: profileUsername });

    if (!user) {
      throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
    }

    if (userId === user.id) {
      throw new HttpException(
        'Following and follower cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepo.findOneBy({
      followerId: userId,
      followingId: user.id,
    });

    if (!follow) {
      const followToCreate = new FollowEntity();

      followToCreate.followerId = userId;
      followToCreate.followingId = user.id;

      await this.followRepo.save(followToCreate);
    }

    return {
      ...user,
      following: true,
    };
  }

  async unfollowProfile(
    userId: number,
    profileUsername: string,
  ): Promise<TProfile> {
    const user = await this.userRepo.findOneBy({ username: profileUsername });

    if (!user) {
      throw new HttpException('This user does not exist', HttpStatus.NOT_FOUND);
    }

    if (userId === user.id) {
      throw new HttpException(
        'Following and follower cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepo.delete({
      followerId: userId,
      followingId: user.id,
    });

    return {
      ...user,
      following: false,
    };
  }

  buildProfileResponse(profile: TProfile): IProfileRes {
    delete profile.email;
    return { profile };
  }
}
