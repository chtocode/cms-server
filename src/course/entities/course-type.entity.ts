import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StudentProfileEntity } from '../../students/entities/student-profile.entity';

@Entity()
export class CourseTypeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => StudentProfileEntity)
    students: StudentProfileEntity[];
}
