import { ApiProperty } from '@nestjs/swagger';

export class PaginatorDto {
    @ApiProperty()
    page: number; // start: 1;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    total?: number;
}
