import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IApiTags } from '../config/api-tags';
import { TransformInterceptor } from '../interceptors/response.interceptors';
import { Role } from '../role/role.enum';
import { StudentProfileDto } from '../students/dto/student-profile.dto';
import { TeacherProfileDto } from '../teachers/dto/teacher-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserValidatePipe } from './pipes/user.pipe';
import { ProfileGuard } from './profile.guard';
import { UsersService } from './users.service';

@Controller()
@ApiTags(IApiTags.Users)
@UseInterceptors(TransformInterceptor)
@ApiResponse({})
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('signup')
    @UsePipes(UserValidatePipe)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @ApiBearerAuth()
    @ApiQuery({ name: 'userId', type: 'number', description: 'user id', required: false })
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    profile(@Query('userId') userId: number, @Req() req) {
        const role: Role = req.user.role;

        if (role === Role.Manager) {
            if (!userId) {
                throw new BadRequestException('Manager profile is not supported now');
            } else {
                return this.usersService.findProfile(userId);
            }
        } else {
            return this.usersService.findProfile(req.user.userId);
        }
    }

    @ApiBearerAuth()
    @ApiBody({ type: TeacherProfileDto, required: true })
    @Put('profile/teacher/:id')
    @UseGuards(JwtAuthGuard, ProfileGuard)
    teacherProfile(@Body() profile: TeacherProfileDto) {
        return this.usersService.updateTeacherProfile(profile as TeacherProfileDto);
    }

    @ApiBearerAuth()
    @ApiBody({ type: StudentProfileDto, required: true })
    @Put('profile/student/:id')
    @UseGuards(JwtAuthGuard, ProfileGuard)
    studentProfile(@Body() profile: StudentProfileDto) {
        return this.usersService.updateStudentProfile(profile as StudentProfileDto);
    }
}
