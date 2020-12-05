import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_SENSORTYPE } from 'src/app/shared/constants/app.constants';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class SensorTypeService {
    urlEndPoint: string = BASEURL_DEV_SENSORTYPE;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    saveSensorType(sensorUrl: string, sensorType: SensorType) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };

        if (sensorUrl == null) {
            return this.http.post(this.urlEndPoint, sensorType, options);
        } else {
            return this.http.put(sensorUrl, sensorType, options);
        }
    }

    getSensorTypeList() {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getSensorTypeByUuid(sensorUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(sensorUrl, options);
    }

    deleteSensorType(sensorUrl: string) {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.delete(sensorUrl, options);
    }

    upload(file: File, sensorUrl: string): any {
        const formData: FormData = new FormData();
        formData.append('file', file);
        let headers = new HttpHeaders({
            //'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': 'application/json',
            'X-TenantID': this.authService.getTenantId(),
            'response-type': 'blob',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let options = { headers: headers };
        return this.http.post(`${sensorUrl}/upload`, formData, options);
    }

    getSensorTypeImage(filename: string) {
        let body = new URLSearchParams();
        body.set('filename', filename);
        let headers = new HttpHeaders({
            //'Content-Type': 'application/x-www-form-urlencoded',
            //'Accept': 'application/json',
            'X-TenantID': this.authService.getTenantId(),
            'response-type': 'blob',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        return this.http.get(this.urlEndPoint + `/download/${filename}`, { headers, responseType: 'blob' }).pipe(mergeMap((res: Blob) => this.createImageFromBlob(res)));
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