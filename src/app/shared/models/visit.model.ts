import { IUser } from '../interfaces/iUser.interface';
import { IVisit } from '../interfaces/iVisit.interface';
import { BaseModel } from './base.model';

export class Visit extends BaseModel implements IVisit {
    uuid: string;
    reason: string;
    userUuid: string;
    startDate: Date;
    endDate: Date;
}