import { IsEmail } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntityWithTimeStamp } from '../../base/entity';
import { StudentCourseEntity } from './student-course.entity';
import { StudentProfileEntity } from './student-profile.entity';
import { StudentTypeEntity } from './student-type.entity';

@Entity()
export class StudentEntity extends EntityWithTimeStamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
    })
    @IsEmail()
    email: string;

    @Column()
    name: string;

    @ManyToOne(() => StudentTypeEntity, { cascade: true })
    type: StudentTypeEntity;

    @Column({
        nullable: true,
    })
    country: string;

    @OneToMany(() => StudentCourseEntity, (studentCourse) => studentCourse.student)
    courses: StudentCourseEntity[];

    @Column({
        name: 'profileId',
    })
    profileId: number;

    @OneToOne(() => StudentProfileEntity, { cascade: true })
    @JoinColumn({
        name: 'profileId',
    })
    profile: StudentProfileEntity;
}
