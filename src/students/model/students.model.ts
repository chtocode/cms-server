import { CourseShort } from '../../course/model/course.model';
import { BaseType, ListResponse, OperationTimestampResponse } from '../../shared/model/shared.model';

export interface Student<T = CourseShort> extends OperationTimestampResponse {
    country: string;
    courses: T[];
    email: string;
    id: number;
    name: string;
    type: BaseType;
}

export interface StudentsResponse extends ListResponse {
    students: Student[];
}

export interface StudentProfile {
    address: string[];
    age: number;
    avatar: string;
    country: string;
    description: string;
    education: string;
    email: string;
    gender: number;
    interest: string[];
    memberEndAt: string | Date;
    memberStartAt: string | Date;
    name: string;
    phone: string;
}
