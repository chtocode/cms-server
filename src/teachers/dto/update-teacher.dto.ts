import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';
import { CreateTeacherDto } from './create-teacher.dto';

@ApiTags(IApiTags.Teachers)
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
    @ApiProperty()
    id: number;
}
