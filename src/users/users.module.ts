import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserValidatePipe } from './pipes/user.pipe';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersService, UserValidatePipe],
    exports: [UsersService, UserValidatePipe],
    controllers: [UsersController],
})
export class UsersModule {}
