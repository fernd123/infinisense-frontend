import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BASEURL_DEV_LOGIN } from '../../shared/constants/app.constants';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<User>;

    urlEndPoint: string = BASEURL_DEV_LOGIN;

    constructor(private http: HttpClient, private router: Router) {
        this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('currentUser'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    isUserLogged() {
        return this.getTokenInfo() !== null;
    }

    getTokenInfo() {
        if (this.currentUserValue && this.currentUserValue.access_token) {
            return jwt_decode(this.currentUserValue.access_token);
        }
        return null;
    }

    login(username: string, password: string, tenantId: string) {
        return this.doLogin(this.urlEndPoint, username, password, tenantId);
    }

    refreshToken() {
        const user = this.currentUserSubject.value;
        if (!user) {
            return of(null);
        }
        // Generate headers
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Genrate params for token refreshing
        const body = new URLSearchParams();
        body.set('tenant_id', user.tenant_id);
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', user.refresh_token);

        // Save petition options into a variable
        const options = { headers: tokenHeaders };

        const loginURL = this.urlEndPoint;

        // Execute the request
        return this.http.post(loginURL, body.toString(), options).pipe(map((token: any) => {
            // login successful if there's a jwt token in the response
            if (token && token.jwt) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes                
                localStorage.setItem('currentUser', JSON.stringify(token.jwt));
            }
        }));
    }

    doLogin(loginURL: string, username: string, password: string, tenantId: string) {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', password);

        if (tenantId) {
            body.set('tenant_id', tenantId);
        }

        let options = { headers: headers };

        return this.http.post(loginURL, body.toString(), options)
            .pipe(map((token: any) => {
                // login successful if there's a jwt token in the response
                if (token && token.jwt) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', token.jwt);
                }
            }));
    }

    logout(doRedirect?: boolean) {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        // Redirect user to base login or portal login
        if (doRedirect) {
            this.router.navigate(['/admin']);
        }
    }
}