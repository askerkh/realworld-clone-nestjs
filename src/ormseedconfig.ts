import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './ormconfig';

export const seedConfig: DataSourceOptions = {
  ...config,
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
};

export const connectionSource = new DataSource(seedConfig);
