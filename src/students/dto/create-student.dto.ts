import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';

@ApiTags(IApiTags.Students)
export class CreateStudentDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    type: number;
}

