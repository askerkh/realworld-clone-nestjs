import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/createComment.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleEntity } from '@app/article/article.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly comRepo: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
  ) {}

  async createComment(
    userId: number,
    slug: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const comment = new CommentEntity();

    Object.assign(comment, createCommentDto);

    const article = await this.findBySlug(slug);

    const author = await this.userRepo.findOneBy({ id: userId });

    Object.assign(comment, {
      article,
      author,
    });
    await this.comRepo.save(comment);

    delete comment.article;

    return comment;
  }

  async deleteComment(id: number) {
    return await this.comRepo.delete({ id });
  }

  async getComments(slug: string) {
    const article = await this.findBySlug(slug);

    return article.comments;
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepo.findOneBy({ slug });

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  buildCommentRes(comment: CommentEntity) {
    return { comment };
  }

  buildCommentsRes(comments: CommentEntity[]) {
    return { comments };
  }
}
