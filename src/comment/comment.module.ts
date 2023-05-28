import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '@app/user/user.entity';
import { ArticleEntity } from '@app/article/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, UserEntity, ArticleEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
