import { ICompany } from '../interfaces/iCompany.interface';
import { BaseModel } from './base.model';

export class Company extends BaseModel implements ICompany {
    uuid: string;
    name: string;
    description: string;
    active: boolean;
}