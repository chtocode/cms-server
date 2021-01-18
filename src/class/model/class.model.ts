import { Course, Schedule } from '../../course/model/course.model';

export interface ClassSchedule extends Course {
    schedule: Schedule;
}
