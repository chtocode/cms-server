import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MessageEntity } from './entities/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageSubscriber } from './subscriber/message.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([MessageEntity]), UsersModule],
    controllers: [MessageController],
    providers: [MessageService, MessageSubscriber],
})
export class MessageModule {}
