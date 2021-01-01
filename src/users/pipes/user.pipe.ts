import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { Role } from '../../role/role.enum';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserValidatePipe implements PipeTransform {
    transform(value: CreateUserDto, _: ArgumentMetadata) {
        const { email, password, role } = value;

        if (!isEmail(email)) {
            throw new BadRequestException('Email invalid!');
        }

        if (this.isRoleInvalid(role)) {
            throw new BadRequestException('Role invalid!');
        }

        if (this.isPasswordInvalid(password)) {
            throw new BadRequestException('Password invalid!');
        }

        return value;
    }

    /**
     * 验证密码
     */
    private isPasswordInvalid(pwd: string): boolean {
        return pwd.length < 4 || pwd.length > 16;
    }

    /**
     * 只允许用户创建三个角色
     */
    private isRoleInvalid(role: string): boolean {
        const availableRoles: string[] = [Role.Manager, Role.Student, Role.Teacher];

        return !availableRoles.includes(role);
    }
}
