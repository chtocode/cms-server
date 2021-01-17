import { BadRequestException, Controller, Get, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Connection } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { UserEntity } from '../users/entities/user.entity';
import { Role } from './../role/role.enum';
import { StatisticsService } from './statistics.service';

@ApiTags(IApiTags.Statistics)
@ApiBearerAuth()
@Controller(IApiTags.Statistics.toLowerCase())
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService, private connection: Connection) {}

    @Get('overview')
    overview(@Req() req) {
        if (req.user.role !== Role.Manager) {
            throw new BadRequestException('Permission denied!');
        }

        return this.statisticsService.getOverview();
    }

    @Get('student')
    @ApiQuery({ type: 'number', name: 'userId', required: false })
    async student(@Query('userId') userId: number, @Req() req) {
        const role = req.user.role;

        /**
         * manager can view student, teacher or whole statistics
         * teacher and student can view own statistics only
         */
        if (role === Role.Teacher) {
            return this.statisticsService.getStudentStatisticForTeacher(req.user.userId);
        } else if (role === Role.Manager) {
            if (userId) {
                const user = await this.connection.getRepository(UserEntity).findOne(userId);

                if (user.role === Role.Teacher) {
                    return this.statisticsService.getStudentStatisticForTeacher(userId);
                } else if (user.role === Role.Student) {
                    return this.statisticsService.getStudentStatisticForStudent(userId);
                } else {
                    return this.statisticsService.getStudentStatisticForManager();
                }
            } else {
                return this.statisticsService.getStudentStatisticForManager();
            }
        } else {
            return this.statisticsService.getStudentStatisticForStudent(req.user.userId);
        }
    }

    @Get('teacher')
    @ApiQuery({ type: 'number', name: 'userId', required: false })
    teacher(@Query('userId') userId: number, @Req() req) {
        const role = req.user.role;

        /**
         * manager can view teacher or the whole statistics
         * teacher can view own statistics
         * student can not view any;
         */
        if (role === Role.Teacher) {
            return this.statisticsService.getCourseStatisticsForTeacher(req.user.id);
        } else if (role === Role.Manager) {
            if (userId) {
                return this.statisticsService.getCourseStatisticsForTeacher(userId);
            } else {
                return this.statisticsService.getTeacherStatisticsForManger();
            }
        } else {
            throw new BadRequestException('Permission denied!');
        }
    }

    @Get('course')
    @ApiQuery({ type: 'number', name: 'userId', required: false })
    async course(@Query('userId') userId: number, @Req() req) {
        const role = req.user.role;

        /**
         * manager can view teacher or the whole statistics
         * teacher can view own statistics
         * student can not view any;
         */
        if (role === Role.Manager) {
            if (userId) {
                const user = await this.connection.getRepository(UserEntity).findOne(userId);

                if (user.role === Role.Teacher) {
                    return this.statisticsService.getCourseStatisticsForTeacher(userId);
                } else {
                    return this.statisticsService.getCourseStatisticsForManager();
                }
            } else {
                return this.statisticsService.getCourseStatisticsForManager();
            }
        } else if (role === Role.Teacher) {
            return this.statisticsService.getCourseStatisticsForTeacher(req.user.userId);
        } else {
            throw new BadRequestException('Permission denied!');
        }
    }
}
