import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IResponse<T> {
    code?: number;
    data: T;
    msg?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
        const [_, serverRes] = context.getArgs();
        const msg = serverRes.statusCode.toString().match(/^[23]\d+/) ? 'success' : 'fail';

        return next.handle().pipe(map((data) => ({ data, code: serverRes.statusCode, msg })));
    }
}
