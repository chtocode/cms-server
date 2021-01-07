import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';

@ApiTags(IApiTags.Message)
export class MessageStatisticDto {
    @ApiProperty()
    userId: number; // userId
}
