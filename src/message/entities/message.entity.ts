import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { UserEntity } from '../../users/entities/user.entity';
import { MessageType } from '../model/message';

export enum MessageTypeEnum {
    notification = 'notification',
    message = 'message',
}

@Entity()
export class MessageEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.sentMessages)
    from: number; // user id

    @ManyToOne(() => UserEntity, (user) => user.messages)
    to: number; // user id

    @Column()
    content: string;

    @Column()
    alertAt: string;

    @Column()
    status: number;

    @Column({
        type: 'enum',
        enum: MessageTypeEnum,
    })
    type: MessageType;
}
