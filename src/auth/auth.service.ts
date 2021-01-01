import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import { UserEntity } from '../users/entities/user.entity';
import { aesEncrypt } from '../utils/crypto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async validateUser(email: string, pass: string): Promise<any> {
        if (!isEmail(email)) {
            throw new BadRequestException('Email invalid!');
        }

        const user = await this.usersService.findOne(email);

        if (user && this.validatePwd(pass, user)) {
            const { password, ...result } = user;

            return result;
        }

        return null;
    }

    async login(user: CreateUserDto) {
        const payload = { email: user.email, role: user.role };
        const token = this.jwtService.sign(payload, { expiresIn: '1d' });

        return { token };
    }

    validatePwd(pwd: string, user: UserEntity): boolean {
        const { key, password, iv } = user;
        const result = aesEncrypt(pwd, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

        return password === result;
    }
}
