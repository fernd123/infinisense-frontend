import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';
import { User } from 'src/app/shared/models/user.model';


@Injectable({ providedIn: 'root' })
export class UserService {



    urlEndPoint: string = BASEURL_DEV_USER;

    constructor(private http: HttpClient, private router: Router) { }

    getUserByDni(dni: string) {
        // Generate headers
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        const loginURL = this.urlEndPoint + "/" + dni;

        // Execute the request
        return this.http.get(loginURL, options);
    }

    getUserSignature(uuid: any) {
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        const loginURL = this.urlEndPoint + "/" + uuid + "/signature";

        // Execute the request
        return this.http.get(loginURL, { responseType: 'text' });
    }

    getExternalUsers(tenantId: string) {
        // Generate headers
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        const loginURL = this.urlEndPoint;

        // Execute the request
        return this.http.get(loginURL, options);
    }

    getInternalUsers(arg0: string) {
        // Generate headers
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        const loginURL = this.urlEndPoint;

        // Execute the request
        return this.http.get(loginURL, options);
    }

    getUserByUuid(uuid: string, tenantId: string) {
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        // Execute the request
        return this.http.get(this.urlEndPoint + "/profile/" + uuid, options);

    }

    saveUser(user: User, tenantId: string) {
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        let body = new URLSearchParams();
        body.set('username', user.username);
        body.set('firstname', user.firstname);
        body.set('lastname', user.lastname);
        body.set('password', user.password);
        body.set('active', `${user.active}`);
        body.set('roles', user.roles);
        body.set('email', user.email);
        body.set('dni', user.dni);
        if (tenantId) {
            body.set('tenantId', tenantId);
        }

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        // Execute the request
        if (user.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + user.uuid, body.toString(), options);
        }
    }
}