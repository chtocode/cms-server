import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from './../../config/api-tags';

@ApiTags(IApiTags.Teachers)
export class CreateTeacherDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    skills: SkillDto[];
    
    @ApiProperty()
    email: string;
}


@ApiTags(IApiTags.Teachers)
export class SkillDto { 
    @ApiProperty()
    name: string;

    @ApiProperty()
    level: number;
}