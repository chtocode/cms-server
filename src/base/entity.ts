import { format } from 'date-fns';
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

const parseTime = (value) => format(new Date(value), 'yyyy-MM-dd hh:mm:ss');
const transformer = { to: (value) => value, from: parseTime };

export class EntityWithTimeStamp {
    @CreateDateColumn({ type: 'timestamp', transformer })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', transformer })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', transformer})
    deletedAt: Date;
}
