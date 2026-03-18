// PostgreSQL 数据库连接
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Player } from './entities/Player';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'zomgame',
  synchronize: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Player]
});

export async function initDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('[Database] Connected to PostgreSQL');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
  }
}
