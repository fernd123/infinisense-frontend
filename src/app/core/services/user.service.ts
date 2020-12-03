import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';
import { User } from 'src/app/shared/models/user.model';
import { AuthenticationService } from './authentication.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    urlEndPoint: string = BASEURL_DEV_USER;


    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    getUserByDni(dni: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        const loginURL = this.urlEndPoint + "/" + dni;
        return this.http.get(loginURL, options);
    }

    getUserSignature(uuid: any) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        const loginURL = this.urlEndPoint + "/" + uuid + "/signature";
        return this.http.get(loginURL, { responseType: 'text' });
    }

    getExternalUsers() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/external", options);
    }

    getInternalUsers() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        const loginURL = this.urlEndPoint;
        return this.http.get(loginURL, options);
    }

    getUserByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/profile/" + uuid, options);
    }

    saveUser(user: User) {
        let body = new URLSearchParams();
        body.set('username', user.username);
        body.set('firstname', user.firstname);
        body.set('lastname', user.lastname);
        body.set('password', user.password);
        body.set('active', `${user.active}`);
        body.set('roles', user.roles);
        body.set('email', user.email);
        body.set('dni', user.dni);

        // Save petition options into a variable
        let options = { headers: this.authService.getHeadersTenancyDefault() };

        // Execute the request
        if (user.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + user.uuid, body.toString(), options);
        }
    }
}