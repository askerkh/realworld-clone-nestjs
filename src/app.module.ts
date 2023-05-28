import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TagModule } from '@app/tag/tag.module';
import { UserModule } from '@app/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config, connectionSource } from '@app/ormconfig';
import { AuthMiddleware } from '@app/user/middlewares/auth.middleware';
import { ArticleModule } from '@app/article/article.module';
import { ProfileModule } from '@app/profile/profile.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    TagModule,
    UserModule,
    ArticleModule,
    ProfileModule,
    CommentModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return config;
      },
      dataSourceFactory: async () => {
        await connectionSource.initialize();
        return connectionSource;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
