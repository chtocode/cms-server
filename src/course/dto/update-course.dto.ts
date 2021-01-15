import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    @ApiProperty()
    id: number;
}

export class UpdateScheduleDto {
    @ApiPropertyOptional()
    scheduleId?: number;

    @ApiPropertyOptional()
    courseId?: number;

    @ApiPropertyOptional()
    current?: number;

    @ApiPropertyOptional()
    status?: number;

    @ApiPropertyOptional()
    chapters?: Partial<ChapterDto>[];

    @ApiPropertyOptional()
    classTime?: string[];
}

export class ChapterDto {
    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    id: number;

    @ApiProperty()
    content: string;

    @ApiProperty()
    order: number;
}
