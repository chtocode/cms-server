import { plainToClass, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, validateSync } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
    Provision = 'provision',
}

export function ToBoolean(): (target: any, key: string) => void {
    return Transform((value: any) => value === 'true' || value === true || value === 1 || value === '1');
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    @Transform((v) => +v)
    PORT: string;

    @IsBoolean()
    @ToBoolean()
    IS_PROD: boolean;

    @IsBoolean()
    @ToBoolean()
    IS_DEV: boolean;
}

/**
 *
 * @param config env file key-value pairs
 */
export function validate(config: Record<string, string | boolean | number>) {
    const validatedConfig = plainToClass(EnvironmentVariables, config);
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
