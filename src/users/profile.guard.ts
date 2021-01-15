import { ExecutionContext, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Role } from '../role/role.enum';
import { StudentEntity } from '../students/entities/student.entity';
import { TeacherEntity } from '../teachers/entities/teacher.entity';

@Injectable()
export class ProfileGuard {
    constructor(private connection: Connection) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const { id: profileId } = request.body;
        const { email, role } = user;

        if (!request.route.path.includes(role)) {
            return false;
        }

        if (role === Role.Teacher) {
            const teacher = await this.connection
                .getRepository(TeacherEntity)
                .createQueryBuilder('teacher')
                .select('teacher.profileId')
                .where(`teacher.email = :email`)
                .setParameters({ email })
                .getOne();

            return profileId === teacher.profileId;
        }

        if (role === Role.Student) {
            const student = await this.connection
                .getRepository(StudentEntity)
                .createQueryBuilder('student')
                .select('student.profileId')
                .where(`student.email = :email`)
                .setParameters({ email })
                .getOne();

            return profileId === student.profileId;
        }

        return false;
    }
}
