import { User } from '../models/user.model';

export interface Auditable {
    createdDate: Date;
    modifiedDate: Date;
    createdBy: string | User;
    createdBy_identifier: string,
    modifiedBy: string | User;
    modifiedBy_identifier: string,
}

export function isAuditable(object): object is Auditable {
    const auditObject = object as Auditable;
    return auditObject.createdDate !== undefined && auditObject.modifiedDate !== undefined
        && auditObject.createdDate !== undefined && auditObject.modifiedDate !== undefined;
}