import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_REASON } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';

@Injectable({ providedIn: 'root' })
export class ReasonService {

    urlEndPoint: string = BASEURL_DEV_REASON;

    constructor(private http: HttpClient, private router: Router) {
        
    }

    saveReason(reason: Reason, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('reason', JSON.stringify(reason));

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };

        return this.http.post(this.urlEndPoint, body.toString(), options)
            .pipe(map((res: any) => {
            }));
    }

    getReasons(tenantId: string) {
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

       
}