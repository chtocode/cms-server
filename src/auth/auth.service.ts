import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import { Repository } from 'typeorm';
import { Role } from '../role/role.enum';
import { UserEntity } from '../users/entities/user.entity';
import { aesEncrypt } from '../utils/crypto';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { UsersService } from './../users/users.service';
import { TokenBlacklistEntity } from './token-blacklist.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectRepository(TokenBlacklistEntity) private blacklistRepo: Repository<TokenBlacklistEntity>,
    ) {}

    async validateUser(email: string, pass: string, role: Role): Promise<any> {
        if (!isEmail(email)) {
            throw new BadRequestException('Email invalid!');
        }

        const user = await this.usersService.findOne({ email });

        if (user && this.validatePwd(pass, user) && user.role === role) {
            const { password, ...result } = user;

            return result;
        }

        return null;
    }

    async login(user: CreateUserDto): Promise<{ token: string; role: Role; userId: number }> {
        const { id } = await this.usersService.findOne({ email: user.email });
        const payload = { email: user.email, role: user.role, id };
        const expiresIn = this.configService.get<boolean>('IS_PROD') ? '7 days' : '90 days';
        const token = this.jwtService.sign(payload, { expiresIn });

        return { token, role: user.role, userId: id };
    }

    validatePwd(pwd: string, user: UserEntity): boolean {
        const { key, password, iv } = user;
        const result = aesEncrypt(pwd, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

        return password === result;
    }

    async invalidToken(token: string): Promise<boolean> {
        const value = token.split('Bearer ')[1];

        await this.blacklistRepo.save({ token: value });

        return true;
    }

    async isInBlackList(token: string): Promise<boolean> {
        const value = token.split('Bearer ')[1];
        const target = await this.blacklistRepo.findOne({ token: value });

        return !target;
    }
}
