import { ListResponse } from '../../shared/model/shared.model';
import { Sales } from './sales.model';

export interface CourseShort {
    id: number;
    name: string;
    courseId: number;
}

export type DurationUnit = 1 | 2 | 3 | 4 | 5;

type CourseStatus = 0 | 1 | 2;

export interface CourseType {
    id: number;
    name: string;
}

export interface Course {
    id: number;
    name: string;
    uid: string; //code
    detail: string;
    startTime: string | Date;
    price: number;
    maxStudents: number;
    star: number;
    status: CourseStatus;
    duration: number;
    durationUnit: DurationUnit;
    cover: string;
    teacherName: string;
    teacherId: number;
    type: CourseType[];
    scheduleId: number;
}

export interface CourseResponse extends ListResponse {
    courses: Course[];
}

export interface Chapter {
    name: string;
    id: number;
    content: string;
    order: number;
}

export interface Schedule {
    id: number;
    status: number;
    current: number;
    chapters: Chapter[];
    classTime: string[];
}

export interface CourseDetailResponse extends Course {
    sales: Sales;
    schedule: Schedule;
}

export interface StudentCourse {
    id: number;
    studentId: number;
    courseDate: string | Date;
    course: Course;
}

export interface StudentOwnCoursesResponse extends ListResponse {
    courses: StudentCourse[];
}
