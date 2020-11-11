import { isFunction } from 'util';
export interface Resource {
    _links?: any;
    _embedded?: any;
}

export class ListResource<T>{
    _links: any;
    data: T[]
    page: Page;
}

export class Page {
    size: number;
    totalElements?: number;
    totalPages?: number;
    number: number
}

export function isListResource(object): object is ListResource<any> {
    return object && object.data;
}

export function isAFunction(object): object is Function {
    return isFunction(object);
}

export function isNewResource(resource: Resource): boolean {
    return (!resource || !resource._links || !resource._links.self || !resource._links.self.href)
}