import { Resource } from './resource.model';
import { Auditable } from '../interfaces/auditable.interface';

export class BaseModel implements Resource, Auditable {
    createdDate: Date;
    modifiedDate: Date;
    createdBy: string;
    createdBy_identifier: string;
    modifiedBy: string;
    modifiedBy_identifier: string;
    _links: any; _embedded: any;
}