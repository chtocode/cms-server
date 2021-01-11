import { PaginatorDto } from '../../shared/dto/shared.dto';

export interface QueryStudentsDto extends PaginatorDto {
    query?: string;
    userId?: number;
}
