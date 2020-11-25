import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_SENSORTYPE } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';

@Injectable({ providedIn: 'root' })
export class SensorTypeService {


    urlEndPoint: string = BASEURL_DEV_SENSORTYPE;

    constructor(private http: HttpClient, private router: Router) {

    } 

    saveSensorType(sensorType: SensorType, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('name', sensorType.name);
        body.set('description', sensorType.description);
        //body.set('image', sensorType.image);
        body.set('active', `${sensorType.active}`);

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };

        if (sensorType.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + sensorType.uuid, body.toString(), options);
        }
    }

    getSensorTypeList(tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint, options);
    }

    getSensorTypeByUuid(uuid: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    deleteSensorType(uuid: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.delete(this.urlEndPoint + "/" + uuid, options);
    }

    upload(file: File, uuid: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.urlEndPoint}/${uuid}/upload`, formData);
    }

    getSensorTypeImage(filename: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('filename', filename);
        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };
        return this.http.get(this.urlEndPoint + `/download/${filename}`, { responseType: 'blob' }).pipe(mergeMap(res => this.createImageFromBlob(res)));
    }

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

}