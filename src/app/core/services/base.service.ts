import { AuthenticationService } from './authentication.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { BASEURL_PROXY } from '../../shared/constants/app.constants';
import { Observable, forkJoin, of, isObservable } from 'rxjs';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import { Injector } from '@angular/core';
import { ListResource, Resource } from 'src/app/shared/models/resource.model';
declare function stringToInt(initials: string): any;

export function RestService(options: { serviceURL: string, resource: string }) {
  return function (constructor: Function) {
    constructor.prototype.serviceURL = options.serviceURL;
    constructor.prototype.resource = options.resource;
    constructor.prototype.urlEndPoint = BASEURL_PROXY + options.serviceURL + "/" + options.resource;
  }
}
export type FetchFunction<T> = (data: any | any[]) => ListResource<T> | T;
export type ResponseHandler<T> = (data: any | any[], res: ListResource<T> | T) => void;

export interface FetchPropertyOptions {
  name: string;

  /**
   * If true, indicates that the property will be fetched for all data by making a single request. Otherwise a request per record will be done
   */
  singleRequest?: boolean;

  /**
   * Function that must return an observable of the data to fetch for this property
   * @argument data If singleRequest is true, data is an array of records, otherwise is a single record
   * @argument res It's the fetchFunction response data
   */
  fetchFunction?: FetchFunction<any>;

  /** Function to handle response. If is a singleRequest, this property is required. 
   * @argument data If singleRequest is true, data is an array of records, otherwise is a single record
   * @argument res It's the fetchFunction response data
   */
  responseHandler?: ResponseHandler<any>;
  target?: string;
}

export interface IRequest {
  request: Observable<any>,
  error: string | Function
}

export function isAnIRequest(object: any): object is IRequest {
  return object.hasOwnProperty('request') && object.hasOwnProperty('error');
}

export abstract class BaseService<I, R extends Resource>{

  public urlEndPoint: string;
  public resource: string;
  protected serviceURL: string;
  // protected client = createClient(this.urlEndPoint);
  protected http: HttpClient;
  protected authenticationService: AuthenticationService;

  constructor(injector: Injector) {
    this.http = injector.get(HttpClient);
    this.authenticationService = injector.get(AuthenticationService);
  }

  getAny<T>(uri: string, requestParameters?: any): Observable<T> {
    return this.http.get<T>(uri, requestParameters).pipe(map(res => res as any));
  }

  getById(uuid: string, requestParameters?: any, fetchProperties?: FetchPropertyOptions[]): Observable<R> {
    let uri = this.urlEndPoint + '/' + uuid;
    return this.getOne(uri, requestParameters, fetchProperties);
  }

  getAll(requestParameters?: any, fetchProperties?: FetchPropertyOptions[]): Observable<ListResource<R>> {
    return this.fetchData(requestParameters, fetchProperties);
  }

  getOne(url: string, requestParameters?: any, fetchProperties?: FetchPropertyOptions[]): Observable<R> {
    return this.http.get<R>(url, requestParameters)
      .pipe(map(res => this.convertOne(res as any)), mergeMap(res => {
        if (res && fetchProperties && fetchProperties.length > 0) {
          let tmpListResource: any = { data: [res] };
          return this.fetchRecordsPropertiesV2<R>(tmpListResource, fetchProperties).pipe(map(res => res.data[0]));
        } else {
          return of(res);
        }
      }));
  }

  fetchData(requestParameters?: any, fetchProperties?: FetchPropertyOptions[]): Observable<ListResource<R>> {
    return this.http.get<ListResource<R>>(this.urlEndPoint, requestParameters)
      .pipe(map(res => this.convertDataArray<R>(res, this.resource)),
        mergeMap(res => this.fetchRecordsPropertiesV2<R>(res, fetchProperties)));
  }

  fetchRecordsPropertiesV2<T extends Resource>(listResource: ListResource<T>, properties: FetchPropertyOptions[]): Observable<ListResource<T>> {
    if (listResource.data && listResource.data.length > 0 && properties && properties.length > 0) {
      return new Observable<ListResource<T>>(observer => {
        let requests: {
          prop: FetchPropertyOptions,
          request: Observable<any>
          handler: Function,
          record?: T
        }[] = [];

        properties.forEach(prop => {
          if (prop.singleRequest) {
            if (!prop.responseHandler) {
              observer.error("response handler should be defined for singleRequest properties");
              observer.complete();
            }
            requests.push({
              prop: prop,
              request: prop.fetchFunction(listResource.data),
              handler: prop.responseHandler
            });
          } else {
            listResource.data.forEach(record => {
              if (prop.responseHandler) {
                requests.push({
                  prop: prop,
                  request: prop.fetchFunction(record),
                  handler: prop.responseHandler
                });
              } else {
                requests.push({
                  prop: prop,
                  request: prop.fetchFunction(record),
                  record: record,
                  handler: (record, res) => record[prop.name] = (res && !res.error) ? res : record[prop.name]
                });
              }
            })
          }
        });

        this.safeMultiRequest(requests.map(req => req.request)).subscribe(responses => {
          responses.forEach((res, index) => {
            try {
              let responseHandler = requests[index].handler;
              if (requests[index].prop.singleRequest) {
                responseHandler(listResource.data, res);
              } else {
                responseHandler(requests[index].record, res);
              }
            } catch (error) {
              console.error(error)
            }
          });
          observer.next(listResource);
          observer.complete();
        });
      });
    } else {
      return of<ListResource<T>>(listResource);
    }
  }

  convertDataArray<T>(res: any, dataPath: string): ListResource<T> {
    res.data = (res._embedded && res._embedded[dataPath]) ? res._embedded[dataPath] : [];
    res.data = res.data.map(record => this.convertOne(record));
    return res as ListResource<T>
  }

  convertOne(record: R): R {
    return record;
  }

  getIdFromLink(uri): string {
    let recordId = this.cleanUri(uri),
      lastPath = recordId.lastIndexOf("/")
    if (lastPath) {
      recordId = recordId.substring(lastPath + 1, recordId.length);
    }
    return recordId;
  }

  remove(uri: string) {
    //this.setHeaders();  
    //const resource = await this.client.delete(uri);
    //uri = this.urlEndPoint+'/ff8081816c045d96016c0462fd1a0001';
    return this.http.delete(this.cleanUri(uri), { observe: 'response' });
  }

  deleteMultiple(uriArray: string[]): Observable<any[]> {
    let deleteObservable = []
    uriArray.forEach(uri => {
      deleteObservable.push(this.remove(uri));
    });
    return this.safeMultiRequest(deleteObservable);
  }

  getAssociation<T>(parentUri: string, association: string): Observable<ListResource<T>> {
    let associationUri = this.cleanUri(parentUri) + "/" + association;
    return this.getAny<T>(associationUri).pipe(map(res => this.convertDataArray(res, association)));
  }

  removeAssociation(parentUri: string, childUri: string, association: string): Observable<any> {
    let associationUri = this.cleanUri(parentUri) + "/" + association + "/" + this.getIdFromLink(this.cleanUri(childUri));
    return this.remove(associationUri);
  }

  removeAssociationMultiple(parentUri: string, childUris: any[], association: string): Observable<any[]> {
    let deleteRequestArray = childUris.map(childUri => this.removeAssociation(parentUri, childUri, association));
    return forkJoin(deleteRequestArray);
  }

  updateAssociation(recordURI: string, associationURIs: string[], association: string): Observable<any> {
    let data = associationURIs ? associationURIs.map(uri => this.cleanUri(uri)).join('\n') : '';
    const options = {
      headers: { 'Content-Type': 'text/uri-list' },
      'observe': "response" as 'response', // to display the full response & as 'body' for type cast
    };
    return this.http.put(this.cleanUri(recordURI) + '/' + association, data, options);
  }

  update(uri: string, data: I) {
    //this.setHeaders();
    //const resource = await this.client.update(uri, data);
    return this.http.put(this.cleanUri(uri), data, { observe: 'response' });
  }

  create(data: I): Observable<HttpResponse<R>> {
    //this.setHeaders();
    //const resource = await this.client.create(this.urlEndPoint, data);
    return this.http.post<R>(this.urlEndPoint, data, { observe: 'response' });
  }

  export(format: string) {
    return this.http.get(this.urlEndPoint + "/export?fileType=" + format, { responseType: "blob" });
  }
  // private setHeaders() {
  //   let currentUser: any = this.authenticationService.currentUserValue;
  //   this.client.addHeader('Authorization', `Bearer ${currentUser.access_token}`);
  // }

  /**
   * when the object has projections o excerpts the uri contains parameters like {?projection}. To avuid to call uri with this text we clean it
   * @param uri 
   */
  public cleanUri(uri): string {
    return uri.replace(/{\?\w*}/g, "");
  }

  updateImage(imageURI: string, file: File) {
    let body = new FormData();
    body.append("file", file);
    return this.http.patch(this.cleanUri(imageURI), body, { observe: 'response' });
  }

  downloadImage(url: string): Observable<string | ArrayBuffer> {
    return this.http.get(url, { responseType: 'blob' }).pipe(mergeMap(res => this.createImageFromBlob(res)));
  }

  /**
    * Render the client logo
    * @param image 
    */
  createImageFromBlob(image: Blob): Observable<string | ArrayBuffer> {
    const imageObservable = new Observable<string | ArrayBuffer>(observer => {
      if (image) {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
          observer.next(reader.result);
          observer.complete();
        }, false);
        reader.readAsDataURL(image);
      } else {
        console.log(image);
        observer.next(null)
        observer.complete();
      }
    });
    return imageObservable;
  }

  /**
   * Preview the logo
   * @param file
   */
  createImageFromFile(file: any): Observable<string | ArrayBuffer> {
    return new Observable<string | ArrayBuffer>(observer => {
      if (!file) {
        observer.next(null);
        observer.complete()
      } else {
        var mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
          alert("Only images are supported.");
          return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
          observer.next(reader.result);
          observer.complete()
        }
      }
    })
  }

  /**
   * Send multiple requests handling errors for each one so that all responses can be handled at once.
   * @param requests 
   */
  safeMultiRequest(requestArray: Observable<any>[] | IRequest[]): Observable<any[]> {
    let requests = [];
    let self = this;
    requestArray.forEach((request: Observable<any> | IRequest) => {
      if (isAnIRequest(request)) {
        requests.push(request.request.pipe(catchError(
          error => {
            let cause;
            if (error && error.error && error.error.message && error.error.message !== "No message available") {
              cause = error.error.message;
            }

            let errorMsg = (typeof request.error === "function") ? request.error(error) : request.error;
            errorMsg = errorMsg ? errorMsg : "Unkown error";
            errorMsg += cause ? ": " + cause : '';
            return of({ error: errorMsg, cause: error });
          }
        )))
      } else {
        requests.push(request.pipe(catchError(error => of({ error: error, cause: error }))))
      }
    });
    return forkJoin(requests);
  }


  getUTCDate(date: any) {
    if (date) {
      let dateData = new Date(date);
      let dateUTC = new Date(Date.UTC(
        dateData.getFullYear(),
        dateData.getMonth(),
        dateData.getDate(),
        dateData.getHours(),
        dateData.getMinutes(),
        dateData.getSeconds()
      ));
      return dateUTC;
    }
    return null;
  }
}
