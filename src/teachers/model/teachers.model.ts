import { Course } from '../../course/model/course.model';
import { DateRangeResponse, ListResponse } from '../../shared/model/shared.model';

export interface Teacher {
    id: number;
    name: string;
    country: string;
    phone: string;
    skills: Skill[];
    courseAmount: number;
    profileId: number;
    email: string;
}

export interface Skill {
    id?: number;
    name: string;
    level: number;
}

export interface TeachersResponse extends ListResponse {
    teachers: Teacher[];
}

export interface TeacherProfile {
    id: number;
    address: string[];
    gender: number;
    birthday: string | Date;
    avatar: string;
    description: string;
    workExperience: WorkExperience[];
    education: Education[];
}

export interface TeacherResponse extends Teacher {
    profile: TeacherProfile;
    courses?: Course[];
}

export interface Education extends DateRangeResponse {
    level: number;
    degree: string;
    startEnd: string;
}

export interface WorkExperience extends DateRangeResponse {
    company: string;
    post: string;
    startEnd: string;
}

export type AddTeacherResponse = Teacher;

export type UpdateTeacherResponse = Teacher;
