import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { IArticleRes } from './types/articleRes.interface';
import { IArticlesRes } from './types/articlesRes.interface';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<IArticlesRes> {
    return await this.articleService.findAll(userId, query);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<IArticlesRes> {
    return await this.articleService.getFeed(userId, query);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleRes> {
    const article = await this.articleService.addArticleToFavorites(
      userId,
      slug,
    );

    return this.articleService.buildArticleRes(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleRes> {
    const article = await this.articleService.deleteArticleFromFavorites(
      userId,
      slug,
    );

    return this.articleService.buildArticleRes(article);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async create(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleRes> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );

    return this.articleService.buildArticleRes(article);
  }

  @Get(':slug')
  @UseGuards(AuthGuard)
  async get(@Param('slug') slug: string): Promise<IArticleRes> {
    const article = await this.articleService.findBySlug(slug);

    return this.articleService.buildArticleRes(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async delete(@User('id') userId: number, @Param('slug') slug: string) {
    return await this.articleService.deleteArticle(userId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async update(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: CreateArticleDto,
  ): Promise<IArticleRes> {
    const article = await this.articleService.updateArticle(
      userId,
      slug,
      updateArticleDto,
    );

    return this.articleService.buildArticleRes(article);
  }
}
