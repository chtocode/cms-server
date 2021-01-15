import { ApiProperty } from '@nestjs/swagger';
import { DurationUnit } from '../model/course.model';

export class CreateCourseDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    uid: string;

    @ApiProperty()
    detail: string;

    @ApiProperty({ description: 'string type' })
    startTime: string | Date;

    @ApiProperty()
    price: number;

    @ApiProperty()
    maxStudents: number;

    @ApiProperty()
    duration: number;

    @ApiProperty({
        type: 'enum',
        enum: [1, 2, 3, 4, 5],
    })
    durationUnit: DurationUnit;

    @ApiProperty()
    cover: string;

    @ApiProperty()
    teacherId: number;

    @ApiProperty({
        description: 'type id or type ids. multi support, pass array of ids',
    })
    type: number[] | number;
}
