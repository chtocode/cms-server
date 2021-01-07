import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import { UserEntity } from '../users/entities/user.entity';
import { aesEncrypt } from '../utils/crypto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        if (!isEmail(email)) {
            throw new BadRequestException('Email invalid!');
        }

        const user = await this.usersService.findOne({ email });

        if (user && this.validatePwd(pass, user)) {
            const { password, ...result } = user;

            return result;
        }

        return null;
    }

    async login(user: CreateUserDto): Promise<{ token: string }> {
        const { id } = await this.usersService.findOne({ email: user.email });
        const payload = { email: user.email, role: user.role, id };
        const expiresIn = this.configService.get<boolean>('IS_PROD') ? '7 days' : '90 days';
        const token = this.jwtService.sign(payload, { expiresIn });

        return { token };
    }

    validatePwd(pwd: string, user: UserEntity): boolean {
        const { key, password, iv } = user;
        const result = aesEncrypt(pwd, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

        return password === result;
    }
}
