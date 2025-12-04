import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContentModule } from './content/content.module';
import { User } from './users/user.entity';
import { Content } from './content/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/elearning.db',
      entities: [User, Content],
      // TODO: figure out what to do with this.
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ContentModule,
  ],
})
export class AppModule {}
