import { Injectable } from '@nestjs/common';
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { MessageService } from '../message.service';
import { Message } from '../model/message';

@Injectable()
@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<MessageEntity> {
    constructor(private connect: Connection, private messageService: MessageService) {
        this.connect.subscribers.push(this);
    }

    listenTo(): any {
        return MessageEntity;
    }

    afterInsert(event: InsertEvent<MessageEntity>): Promise<Message> | void {
        const { entity } = event;

        this.messageService.findOne(entity.id).then((entity) => {
            this.messageService.message$.next(entity);
        });
    }
}
