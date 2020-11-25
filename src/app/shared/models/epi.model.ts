import { IEpi } from '../interfaces/iEpi.interface';
import { BaseModel } from './base.model';

export class Epi extends BaseModel implements IEpi {
    uuid: string;
    name: string;
    description: string;
    active: boolean;
}