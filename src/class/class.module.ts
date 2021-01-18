import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';

@Module({
    imports: [UsersModule],
    controllers: [ClassController],
    providers: [ClassService],
})
export class ClassModule {}
