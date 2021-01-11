export interface CourseShort {
    id: number;
    name: string;
    courseId: number;
}

type DurationUnit = 1 | 2 | 3 | 4 | 5;

type CourseStatus = 0 | 1 | 2;

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
    typeName: string;
    typeId: number;
    scheduleId: number;
}
