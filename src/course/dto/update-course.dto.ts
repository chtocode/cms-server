import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Chapter } from '../model/course.model';
import { IApiTags } from './../../config/api-tags';
import { CreateCourseDto } from './create-course.dto';

@ApiTags(IApiTags.Courses)
export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    @ApiProperty()
    id: number;
}

@ApiTags(IApiTags.Courses)
export class UpdateScheduleDto {
    @ApiProperty()
    scheduleId?: number;

    @ApiProperty()
    courseId?: number;

    @ApiProperty()
    current?: number;

    @ApiProperty()
    status?: number;

    @ApiProperty()
    chapters: Partial<Chapter>[];

    @ApiProperty()
    classTime: string[];
}
