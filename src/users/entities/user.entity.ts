import { IsEmail, IsEnum } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { MessageEntity } from '../../message/entities/message.entity';
import { Role } from '../../role/role.enum';

@Entity()
export class UserEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column()
    @IsEnum(Role)
    role: Role;

    @Column()
    key: string;

    @Column()
    iv: string;

    @Column({
        default: Math.random().toString(36).split('.')[1],
    })
    nickname: string;

    @OneToMany(() => MessageEntity, (message) => message.to)
    messages: MessageEntity[];

    @OneToMany(() => MessageEntity, (message) => message.from)
    sentMessages: MessageEntity[];
}
