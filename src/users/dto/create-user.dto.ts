import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../../config/api-tags';
import { Role } from './../../role/role.enum';

@ApiTags(IApiTags.Users)
export class CreateUserDto {
    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty({ enum: [Role.Manager, Role.Student, Role.Teacher] })
    readonly role: Role;
}
