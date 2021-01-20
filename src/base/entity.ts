import { format } from 'date-fns';
import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export const parseTime = (value: Date) => format(new Date(value), 'yyyy-MM-dd hh:mm:ss');

export const transformer = { to: (value: string) => value, from: parseTime };

export class EntityWithTimeStamp {
    @CreateDateColumn({ type: 'timestamp', transformer })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', transformer })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', transformer, select: false })
    deletedAt: Date;
}

export class EntityWithDateRange {
    @Column({ type: 'date', transformer: transformer })
    startAt: Date;

    @Column({ type: 'date', transformer: transformer })
    endAt: Date;

    @DeleteDateColumn({ type: 'timestamp', transformer, select: false })
    deletedAt: Date;
}
