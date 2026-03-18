// 玩家实体 - 存储玩家游戏数据
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  name!: string;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0 })
  experience!: number;

  @Column({ default: 100 })
  health!: number;

  @Column({ default: 100 })
  maxHealth!: number;

  @Column({ default: 100 })
  stamina!: number;

  @Column({ default: 100 })
  maxStamina!: number;

  @Column({ default: 50 })
  loadCapacity!: number;

  @Column({ default: 5 })
  attack!: number;

  @Column({ default: 0 })
  defense!: number;

  @Column({ type: 'jsonb', default: {} })
  inventory!: object;

  @Column({ type: 'jsonb', default: {} })
  equipment!: object;

  @Column({ default: 1000 })
  x!: number;

  @Column({ default: 1000 })
  y!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
