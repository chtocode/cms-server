import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber, isString, pickBy } from 'lodash';
import { Subject } from 'rxjs';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageEntity } from './entities/message.entity';
import {
    Message,
    MessageResponse,
    MessageStatisticGroup,
    MessageStatisticResponse,
    MessageType,
} from './model/message';

@Injectable()
export class MessageService {
    message$: Subject<Message> = new Subject();

    constructor(@InjectRepository(MessageEntity) private messageRepo: Repository<MessageEntity>) {}

    async create(createMessageDto: CreateMessageDto): Promise<Omit<MessageEntity, 'deletedAt'>> {
        const type: MessageType = createMessageDto.from === createMessageDto.to ? 'notification' : 'message';
        const { deletedAt, ...others } = await this.messageRepo.save({ ...createMessageDto, status: 0, type });

        return others;
    }

    async findAll(
        to: number,
        limit: number,
        page: number,
        status?: number,
        type?: MessageType,
    ): Promise<MessageResponse> {
        const where = pickBy(
            { to, status, type },
            (item: number | string) => isString(item) || (isNumber(item) && !isNaN(item as number)),
        );
        const total = await this.messageRepo.count({ where });
        const messages = (await (this.selectMsg()
            .where(where)
            .skip((page - 1) * limit)
            .take(limit)
            .getMany() as unknown)) as Message[];

        return { total, messages, paginator: { page, limit } };
    }

    async findOne(id: number): Promise<Message> {
        return (this.selectMsg().where({ id }).getOne() as unknown) as Message;
    }

    async update(updateMessageDto: UpdateMessageDto): Promise<boolean> {
        const { ids } = updateMessageDto;
        const { raw } = await this.messageRepo.update(ids, { status: updateMessageDto.status });

        return raw.affectedRows >= 1;
    }

    async remove(id: number): Promise<boolean> {
        const { raw } = await this.messageRepo.softDelete(id);

        return raw.affectedRows >= 1;
    }

    async statistic(userId: number): Promise<MessageStatisticResponse> {
        const receive = await this.generateStatistic('to', userId);
        const sent = await this.generateStatistic('from', userId);

        return { sent, receive };
    }

    /**
     *
     * @param direction - 消息的方向， to: receive from: sent
     * @param userId - user id
     */
    private async generateStatistic(direction: 'to' | 'from', userId: number): Promise<MessageStatisticGroup> {
        const total = await this.messageRepo.count({ [direction]: userId });
        const ntfTotal = await this.messageRepo.count({ [direction]: userId, type: 'notification' });
        const unreadNtf = await this.messageRepo.count({ [direction]: userId, status: 0, type: 'notification' });
        const unreadMsg = await this.messageRepo.count({ [direction]: userId, status: 0, type: 'message' });

        return {
            notification: { total: ntfTotal, unread: unreadNtf, read: ntfTotal - unreadNtf },
            message: {
                total: total - ntfTotal,
                unread: unreadMsg,
                read: total - ntfTotal - unreadMsg,
            },
        };
    }

    private selectMsg(): SelectQueryBuilder<MessageEntity> {
        return this.messageRepo
            .createQueryBuilder('msg')
            .orderBy('msg.createdAt', 'DESC')
            .leftJoinAndSelect('msg.from', 'from')
            .select([
                'msg.content',
                'msg.id',
                'msg.status',
                'msg.createdAt',
                'msg.type',
                'from.nickname',
                'from.id',
                'from.role',
            ]);
    }
}
