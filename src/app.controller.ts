import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';
import { IApiTags } from './config/api-tags';

@Controller()
@ApiTags(IApiTags.Common)
export class AppController {
    constructor(private appService: AppService) {}

    @Get()
    index(@Res() response: Response) {
        response.type('text/html').send(readFileSync(join(__dirname, '..', '/client/index.html')).toString());
    }

    @Get('degrees')
    degree() {
        return this.appService.getDegrees();
    }

    @Get('countries')
    countries() {
        return this.appService.getCountries();
    }
}
