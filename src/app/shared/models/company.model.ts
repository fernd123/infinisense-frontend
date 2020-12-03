import { ICompany } from '../interfaces/iCompany.interface';
import { BaseModel } from './base.model';
import { User } from './user.model';

export class Company extends BaseModel implements ICompany {
    uuid: string;
    name: string;
    description: string;
    aliro: boolean;
    ergo: boolean;
    active: boolean;
    user: User;
}