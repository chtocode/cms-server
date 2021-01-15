import { ApiProperty } from '@nestjs/swagger';

export class StudentProfileDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    address: string[];

    @ApiProperty()
    age: number;

    @ApiProperty()
    avatar: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    education: string;

    @ApiProperty()
    gender: number;

    @ApiProperty()
    interest: string[];

    @ApiProperty()
    memberEndAt: string | Date;

    @ApiProperty()
    memberStartAt: string | Date;

    @ApiProperty()
    phone: string;
}
