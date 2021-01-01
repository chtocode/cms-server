import { PartialType } from '@nestjs/mapped-types';
import { ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';
import { CreateStudentDto } from './create-student.dto';

@ApiTags(IApiTags.Students)
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
