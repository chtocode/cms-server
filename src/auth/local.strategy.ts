import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {} from 'crypto';
import { AES, enc } from 'crypto-js';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email', passReqToCallback: true });
    }

    async validate(req: Request, email: string, password: string): Promise<any> {
        const bytes = AES.decrypt(password, 'cms');
        const pwd = bytes.toString(enc.Utf8);
        const user = await this.authService.validateUser(email, pwd, req.body.role);

        if (!user) {
            throw new UnauthorizedException('Please check your password or email');
        }

        return user;
    }
}
