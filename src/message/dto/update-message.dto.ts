import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';
import { CreateMessageDto } from './create-message.dto';

@ApiTags(IApiTags.Message)
export class UpdateMessageDto extends PartialType(CreateMessageDto) {
    @ApiProperty()
    ids: number[];

    @ApiProperty()
    status: number; // 1: read 0: unread;
}
