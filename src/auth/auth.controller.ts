import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller()
@ApiTags(IApiTags.Auth)
@UseInterceptors(TransformInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Body() req: CreateUserDto) {
        return this.authService.login(req);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    logout(@Req() req: Request) {
        const token = req.headers.authorization;

        return this.authService.invalidToken(token);
    }

    @Get('userRole')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    currentRole(@Req() req) {
        return req.user.role;
    }
}
