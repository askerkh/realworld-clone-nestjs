import { ArticleEntity } from '@app/article/article.entity';

export type TArticle = Omit<ArticleEntity, 'updateTimeStamp'>;
