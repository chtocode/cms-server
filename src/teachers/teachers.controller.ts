import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller(IApiTags.Teachers.toLowerCase())
@ApiTags(IApiTags.Teachers)
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) {}

    @Post()
    @Transaction()
    create(@Body() createTeacherDto: CreateTeacherDto, @TransactionManager() manager: EntityManager) {
        return this.teachersService.create(createTeacherDto, manager);
    }

    @Get()
    @ApiQuery({ name: 'query', type: 'string', description: 'teacher name', required: false })
    @ApiQuery({ name: 'limit', type: 'number', description: 'query count', required: false })
    @ApiQuery({ name: 'page', type: 'number', description: 'current page. first page: 1', required: false })
    findAll(@Query('query') query: string, @Query('page') page: number, @Query('limit') limit: number, @Req() req) {
        const role = req.user.role;

        if (role === 'manager') {
            return this.teachersService.findAll(page, limit, query);
        } else {
            throw new BadRequestException('Permission denied!');
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teachersService.findOne(+id);
    }

    @Put(':id')
    @Transaction()
    update(
        @Param('id') id: string,
        @Body() updateTeacherDto: UpdateTeacherDto,
        @TransactionManager() manager: EntityManager,
    ) {
        return this.teachersService.update(+id, updateTeacherDto, manager);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teachersService.remove(+id);
    }
}
