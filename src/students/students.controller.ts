import { HttpException } from '@nestjs/common';
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
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags(IApiTags.Students)
@ApiBearerAuth()
@Controller(IApiTags.Students.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Post()
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @ApiQuery({ name: 'userId', type: 'number', description: 'user id', required: false })
    @ApiQuery({ name: 'query', type: 'string', description: 'student name', required: false })
    @ApiQuery({ name: 'limit', type: 'number', description: 'query count', required: true })
    @ApiQuery({ name: 'page', type: 'number', description: 'current page. first page: 1', required: true })
    @Get()
    findAll(
        @Query('query') query: string,
        @Query('userId') userId: number,
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Req() req,
    ) {
        if (!userId) {
            userId = req.user.userId;
        }

        const role = req.user.role;

        if (role === 'manager') {
            /**
             * Manager can all students or the students belongs to certain teacher;
             */
            if (!userId || userId === req.user.userId) {
                return this.studentsService.findAll(page, limit, query);
            } else {
                return this.studentsService.findAllBelongTeacher(userId, page, limit, query);
            }
        } else if (role === 'teacher') {
            /**
             * Teachers can view all the students who have taken their courses;
             */
            if (!!userId && userId !== req.user.userId) {
                throw new BadRequestException('Permission denied!');
            } else {
                return this.studentsService.findAllBelongTeacher(req.user.userId, page, limit, query);
            }
        } else {
            throw new BadRequestException('Permission denied!');
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(+id);
    }

    @Put()
    update(@Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(updateStudentDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        if (+id === 1) {
            throw new HttpException('Permission denied. You are forbidden to remove this student.', 403);
        }

        return this.studentsService.remove(+id);
    }
}
