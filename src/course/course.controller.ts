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
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { Role } from '../role/role.enum';
import { UsersService } from './../users/users.service';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateScheduleDto } from './dto/update-course.dto';

@Controller(IApiTags.Courses.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
@ApiTags(IApiTags.Courses)
@ApiBearerAuth()
export class CourseController {
    constructor(private readonly courseService: CourseService, private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createCourseDto: CreateCourseDto) {
        return this.courseService.create(createCourseDto);
    }

    @ApiQuery({ name: 'name', type: 'string', description: 'course name', required: false })
    @ApiQuery({ name: 'type', type: 'string', description: 'course type name', required: false })
    @ApiQuery({ name: 'uid', type: 'string', description: 'course code, correspond to uid', required: false })
    @ApiQuery({ name: 'userId', type: 'number', description: 'user id', required: false })
    @ApiQuery({ name: 'limit', type: 'number', description: 'query count. Required if page set.', required: false })
    @ApiQuery({
        name: 'page',
        type: 'number',
        description: 'current page. first page: 1. Required if limit set',
        required: false,
    })
    @Get()
    async findAll(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Query('name') name: string,
        @Query('type') type: string,
        @Query('uid') uid: string,
        @Query('userId') userId: number,
        @Req() req,
    ) {
        const role: Role = req.user.role;
        const query = { name, type, uid, page, limit };

        if (role === Role.Teacher) {
            return this.courseService.findAllBelongTeacher({ ...query, userId: req.user.userId });
        }

        if (role === Role.Manager) {
            if (userId) {
                const user = await this.usersService.findOne({ id: userId });

                if (user.role === Role.Student) {
                    return this.courseService.findAllBelongStudent({ ...query, userId: req.user.userId }); // only allow view own courses;
                } else if (user.role === Role.Teacher) {
                    return this.courseService.findAllBelongTeacher({ ...query, userId: req.user.userId });
                } else {
                    return this.courseService.findAll(query);
                }
            } else {
                return this.courseService.findAll(query);
            }
        }

        if (role === Role.Student) {
            if (userId && userId === req.user.userId) {
                return this.courseService.findAllBelongStudent({ ...query, userId: req.user.userId }); // only allow view own courses;
            } else {
                return this.courseService.findAll(query);
            }
        }

        throw new BadRequestException(`Can not find courses`);
    }

    @Get('detail')
    findOne(@Query('id') id: number) {
        return this.courseService.findOne(id);
    }

    @Put()
    update(@Body() updateCourseDto: UpdateCourseDto) {
        return this.courseService.update(updateCourseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.courseService.remove(+id);
    }

    @ApiQuery({ name: 'courseId', type: 'number', description: 'course id', required: false })
    @ApiQuery({ name: 'scheduleId', type: 'number', description: 'schedule id', required: false })
    @Get('schedule')
    getSchedule(@Query('courseId') courseId: number, @Query('scheduleId') scheduleId: number) {
        return this.courseService.getCourseSchedule(courseId, scheduleId);
    }

    @ApiBody({ type: UpdateScheduleDto, required: true })
    @Put('schedule')
    @Transaction()
    updateSchedule(@Body() updateScheduleDto: UpdateScheduleDto, @TransactionManager() manager: EntityManager) {
        return this.courseService.updateSchedule(updateScheduleDto, manager);
    }

    @Get('type')
    getCourse() {
        return this.courseService.getCourseTypes();
    }

    @Get('code')
    getCode() {
        return this.courseService.createCourseCode();
    }
}
