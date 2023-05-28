import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { ArticleEntity } from '../article/article.entity';
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date();
  }

  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, { eager: true })
  author: UserEntity;

  @ManyToOne(() => ArticleEntity, (artic) => artic.comments)
  article: ArticleEntity;
}
