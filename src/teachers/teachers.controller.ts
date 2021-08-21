import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller(IApiTags.Teachers.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiTags(IApiTags.Teachers)
@ApiBearerAuth()
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) {}

    @ApiBody({ type: CreateTeacherDto, required: true })
    @Post()
    @Transaction()
    create(@Body() createTeacherDto: CreateTeacherDto, @TransactionManager() manager: EntityManager) {
        return this.teachersService.create(createTeacherDto, manager);
    }

    /**
     * TODO rate limit;
     */
    @ApiQuery({ name: 'query', type: 'string', description: 'teacher name', required: false })
    @ApiQuery({ name: 'limit', type: 'number', description: 'query count', required: false })
    @ApiQuery({ name: 'page', type: 'number', description: 'current page. first page: 1', required: false })
    @Get()
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

    @ApiBody({ type: UpdateTeacherDto, required: true })
    @Put()
    @Transaction()
    update(@Body() updateTeacherDto: UpdateTeacherDto, @TransactionManager() manager: EntityManager) {
        return this.teachersService.update(updateTeacherDto, manager);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        if (+id === 1) {
            throw new HttpException('Permission denied. You are forbidden to remove this teacher.', 403);
        }

        return this.teachersService.remove(+id);
    }
}
