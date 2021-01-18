import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    type: number;
}
