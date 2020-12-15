import { IReasonProjectEmail } from '../interfaces/IReasonProjectEmail.interface';
import { IReasonProjectToken } from '../interfaces/IReasonProjectToken.interface';
import { BaseModel } from './base.model';

export class ReasonProjectToken extends BaseModel implements IReasonProjectToken {
    uuid: string;
    token: string;
    reason: any;
}