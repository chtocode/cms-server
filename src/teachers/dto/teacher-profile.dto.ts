import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherProfileDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    address: string[];

    @ApiProperty()
    gender: number;

    @ApiProperty()
    birthday: string | Date;

    @ApiProperty()
    avatar: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    workExperience: WorkExperienceDto[];

    @ApiProperty()
    education: EducationDto[];

    /**
     * fields below in teacher entity;
     */
    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    skills: { name: string; level: number }[];
}

class EducationDto {
    @ApiPropertyOptional()
    id?: number;

    @ApiProperty()
    level: number;

    @ApiProperty()
    degree: string;

    @ApiProperty({
        description: 'space split date e.g 2020-11-30 2020-12-05 or 2020/01/30 2020/05/30',
    })
    startEnd?: string;
}

class WorkExperienceDto {
    @ApiPropertyOptional()
    id?: number;

    @ApiProperty()
    company: string;

    @ApiProperty()
    post: string;

    @ApiProperty({
        description: 'space split date e.g 2020-11-30 2020-12-05 or 2020/01/30 2020/05/30',
    })
    startEnd?: string;
}
