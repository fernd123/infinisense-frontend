import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { BASEURL_DEV_EPI } from 'src/app/shared/constants/app.constants';
import { Reason } from 'src/app/shared/models/reason.model';
import { Epi } from 'src/app/shared/models/epi.model';

@Injectable({ providedIn: 'root' })
export class EpiService {

    urlEndPoint: string = BASEURL_DEV_EPI;

    constructor(private http: HttpClient, private router: Router) { }

    saveEpi(epi: Epi, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('name', epi.name);
        body.set('description', epi.description);
        body.set('active', `${epi.active}`);

        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        let options = { headers: headers };

        if (epi.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + epi.uuid, body.toString(), options);
        }
    }

    getEpis(tenantId: string) {
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

    getEpisByUuid(uuid: string, tenantId: string) {
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

    deleteEpi(uuid: string, tenantId: string) {
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

}