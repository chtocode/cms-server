import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { CountriesEntity } from './shared/entities/country.entity';
import { DegreeEntity } from './shared/entities/degree.entity';

@Injectable()
export class AppService {
    constructor(private readonly connection: Connection) {}

    getDegrees(): Promise<DegreeEntity[]> {
        return this.connection.getRepository(DegreeEntity).createQueryBuilder().getMany();
    }

    getCountries(): Promise<any> {
        return this.connection.getRepository(CountriesEntity).createQueryBuilder().getMany();
    }
}
