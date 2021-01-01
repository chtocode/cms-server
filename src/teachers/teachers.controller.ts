import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IApiTags } from '../config/api-tags';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
@ApiTags(IApiTags.Teachers)
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) {}

    @Post()
    create(@Body() createTeacherDto: CreateTeacherDto) {
        return this.teachersService.create(createTeacherDto);
    }

    @Get()
    findAll() {
        return this.teachersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teachersService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
        return this.teachersService.update(+id, updateTeacherDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teachersService.remove(+id);
    }
}
