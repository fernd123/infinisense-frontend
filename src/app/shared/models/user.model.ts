import { IUser } from '../interfaces/iUser.interface';
import { BaseModel } from './base.model';

export class User extends BaseModel implements IUser {
    uuid: string;
    activated: boolean;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    email: string;
    dni: string;
    company: string;
    roles: string;
    signature?: any;
}