import { Controller, Get, Res, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { IApiTags } from './config/api-tags';
import { TransformInterceptor } from './interceptors/response.interceptors';

@Controller()
@ApiTags(IApiTags.Common)
export class AppController {
    constructor(private appService: AppService) {}

    @Get()
    index(@Res() response: Response) {
        response.redirect('https://cms-lyart.vercel.app');
    }

    @Get('degrees')
    @UseInterceptors(TransformInterceptor)
    degree() {
        return this.appService.getDegrees();
    }

    @Get('countries')
    @UseInterceptors(TransformInterceptor)
    countries() {
        return this.appService.getCountries();
    }
}
