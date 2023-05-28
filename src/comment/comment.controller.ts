import { ICommentRes } from './types/comRes.interface';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentService } from './comment.service';

@Controller('articles/:slug')
export class CommentController {
  constructor(private readonly comService: CommentService) {}

  @Post('comments')
  @UseGuards(AuthGuard)
  async createComment(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
  ): Promise<ICommentRes> {
    const comment = await this.comService.createComment(
      userId,
      slug,
      createCommentDto,
    );

    return this.comService.buildCommentRes(comment);
  }

  @Get('comments')
  @UseGuards(AuthGuard)
  async getComments(@Param('slug') slug: string) {
    const comments = await this.comService.getComments(slug);

    return this.comService.buildCommentsRes(comments);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('id') id: number) {
    return await this.comService.deleteComment(id);
  }
}
