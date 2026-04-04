import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { User } from './user/user.entity';
import { Task } from './task/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'taskmaster.db',
      entities: [User, Task],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    TaskModule,
  ],
})
export class AppModule {}
