import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';

@ApiTags(IApiTags.Message)
export class CreateMessageDto {
    @ApiProperty()
    from: number; // userId

    @ApiProperty({ required: false })
    to?: number; // userId

    @ApiProperty()
    content: string; // message content

    @ApiProperty()
    alertAt: string; // 推送时间
}
