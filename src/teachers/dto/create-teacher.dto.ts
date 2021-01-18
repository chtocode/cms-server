import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    phone: string;

    @ApiProperty({
        type: 'SkillDto',
        isArray: true,
    })
    skills: SkillDto[];

    @ApiProperty()
    email: string;
}

export class SkillDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    level: number;
}
