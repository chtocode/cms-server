import { BadRequestException, Controller, Get, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { Role } from '../role/role.enum';
import { UsersService } from './../users/users.service';
import { ClassService } from './class.service';

@ApiTags(IApiTags.Class)
@ApiBearerAuth()
@Controller(IApiTags.Class.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class ClassController {
    constructor(private readonly classService: ClassService, private userService: UsersService) {}

    @Get('schedule')
    @ApiQuery({ type: 'number', name: 'userId', required: false })
    async classSchedule(@Query('userId') userId: number, @Req() req) {
        const role = req.user.role;

        /**
         * Students and teachers can view their class schedules;
         * Manager can view the class schedules belong to certain teacher or student.
         */
        if (role === Role.Teacher) {
            return this.classService.getClassScheduleForTeacher(req.user);
        }
        if (role === Role.Student) {
            return this.classService.getClassScheduleForStudent(req.user);
        }

        if (role === Role.Manager) {
            const user = await this.userService.findOne({ id: userId });

            if (user.role === Role.Teacher) {
                return this.classService.getClassScheduleForTeacher(user);
            }

            if (user.role === Role.Student) {
                return this.classService.getClassScheduleForStudent(user);
            }
        }

        throw new BadRequestException(`Can not find a class schedule for user by userId: ${userId}`);
    }
}
