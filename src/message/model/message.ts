import { ListResponse } from '../../shared/model/shared.model';
import { UserEntity } from '../../users/entities/user.entity';

export type MessageType = 'notification' | 'message';

export interface Message {
    createdAt: string;
    id: number;
    content: string;
    status: number;
    from: Pick<UserEntity, 'id' | 'role' | 'nickname'>;
    type: MessageType;
}

/**
 * --------- message response ----------
 */
export interface MessageResponse extends ListResponse {
    messages: Message[];
}

/**
 * --------- statistics response ----------
 */
export interface MessageStatistic {
    total: number;
    read: number;
    unread: number;
}

export interface MessageStatisticGroup {
    notification: MessageStatistic;
    message: MessageStatistic;
}

export interface MessageStatisticResponse {
    sent: MessageStatisticGroup;
    receive: MessageStatisticGroup;
}
