import { ApiProperty } from '@nestjs/swagger';
import { Role } from './../../role/role.enum';

export class CreateUserDto {
    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty({ enum: [Role.Manager, Role.Student, Role.Teacher] })
    readonly role: Role;
}
