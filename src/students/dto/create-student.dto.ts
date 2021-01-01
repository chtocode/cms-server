import { ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';

@ApiTags(IApiTags.Students)
export class CreateStudentDto {}
