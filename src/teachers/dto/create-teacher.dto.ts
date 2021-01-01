import { ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';

@ApiTags(IApiTags.Teachers)
export class CreateTeacherDto {}
