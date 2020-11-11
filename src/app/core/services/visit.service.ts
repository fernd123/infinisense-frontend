import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_VISIT } from 'src/app/shared/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class VisitService {


    urlEndPoint: string = BASEURL_DEV_VISIT;

    constructor(private http: HttpClient, private router: Router) {
        
    }

    saveVisit(visit: Visit, user: User, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('visit', JSON.stringify(visit));
        body.set('user', JSON.stringify(user));

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };

        return this.http.post(this.urlEndPoint, body.toString(), options)
            .pipe(map((res: any) => {
                debugger;
            }));
    }

       
}