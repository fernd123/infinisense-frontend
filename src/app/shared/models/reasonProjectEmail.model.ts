import { IReasonProjectEmail } from '../interfaces/IReasonProjectEmail.interface';
import { BaseModel } from './base.model';

export class ReasonProjectEmail extends BaseModel implements IReasonProjectEmail {
    uuid: string;
    email: string;
    company: string;
    sended: boolean;
    answered: boolean;
}