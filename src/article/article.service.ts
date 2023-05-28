import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindManyOptions, In, Like, Repository } from 'typeorm';
import { IArticleRes } from './types/articleRes.interface';
import slugify from 'slugify';
import { IArticlesRes } from './types/articlesRes.interface';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}

  async findAll(userId: number, query: any): Promise<IArticlesRes> {
    const articlesSelector: FindManyOptions<ArticleEntity> = {
      select: {
        title: true,
        id: true,
        slug: true,
        body: true,
        createdAt: true,
        description: true,
        favoritesCount: true,
        tagList: true,
        updatedAt: true,
      },
      relations: {
        author: true,
      },
      order: {
        createdAt: {
          direction: 'DESC',
        },
      },
    };

    const limitOffsetSelector: FindManyOptions<ArticleEntity> = {
      take: query?.limit || 20,
      skip: query?.offset || 0,
    };

    Object.assign(articlesSelector, limitOffsetSelector);

    if (query?.author) {
      const author = await this.userRepo.findOneBy({
        username: query.author,
      });

      const selector: FindManyOptions<ArticleEntity> = {
        where: {
          author: {
            id: author.id,
          },
        },
      };

      Object.assign(articlesSelector, selector);
    }

    if (query?.tag) {
      const selector: FindManyOptions<ArticleEntity> = {
        where: {
          tagList: Like(`%${query.tag}%`),
        },
      };

      Object.assign(articlesSelector, selector);
    }

    if (query?.favorited) {
      const author = await this.userRepo.findOne({
        where: {
          username: query.favorited,
        },
        relations: {
          favorites: true,
        },
      });
      const ids = author.favorites.map(
        (articleInFavorites) => articleInFavorites.id,
      );

      const selector: FindManyOptions<ArticleEntity> = {
        where: {
          id: In(ids),
        },
      };

      Object.assign(articlesSelector, selector);
    }

    let favoriteIds: number[] = [];

    if (userId) {
      const user = await this.userRepo.findOne({
        where: {
          id: userId,
        },
        relations: {
          favorites: true,
        },
      });

      favoriteIds = user.favorites.map((favorite) => favorite.id);
    }

    const articlesCount = await this.articleRepo.count();

    const articles = await this.articleRepo.find(articlesSelector);

    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);

      return { ...article, favorited };
    });

    return {
      articles: articlesWithFavorites,
      articlesCount,
    };
  }

  async getFeed(userId: number, query: any): Promise<IArticlesRes> {
    const follows = await this.followRepo.find({
      where: {
        followerId: userId,
      },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    const articlesSelector: FindManyOptions<ArticleEntity> = {
      where: {
        author: {
          id: In(followingUserIds),
        },
      },
      relations: {
        author: true,
      },
      order: {
        createdAt: {
          direction: 'DESC',
        },
      },
      take: query?.limit || 20,
      skip: query?.offset || 0,
    };

    const articles = await this.articleRepo.find(articlesSelector);

    const articlesCount = articles.length;

    return {
      articles,
      articlesCount,
    };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepo.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepo.findOneBy({ slug });

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async deleteArticle(userId: number, slug: string): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepo.delete({ slug });
  }

  async updateArticle(
    userId: number,
    slug: string,
    updateArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    if (updateArticleDto?.title) {
      const slug = this.getSlug(updateArticleDto.title);
      Object.assign(article, { slug });
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepo.save(article);
  }

  async addArticleToFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: {
        favorites: true,
      },
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;

      await this.userRepo.save(user);
      await this.articleRepo.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: {
        favorites: true,
      },
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);

      article.favoritesCount--;

      await this.userRepo.save(user);
      await this.articleRepo.save(article);
    }

    return article;
  }

  buildArticleRes(article: ArticleEntity): IArticleRes {
    return {
      article,
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, {
        lower: true,
      }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
