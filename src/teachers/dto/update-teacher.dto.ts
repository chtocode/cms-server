import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
    @ApiProperty()
    id: number;
}
