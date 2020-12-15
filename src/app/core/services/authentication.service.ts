import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BASEURL_DEV_LOGIN } from '../../shared/constants/app.constants';
import jwt_decode from "jwt-decode";
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user.model';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<User>;

    urlEndPoint: string = BASEURL_DEV_LOGIN;

    constructor(private http: HttpClient,
        private rolesService: NgxRolesService,
        private router: Router) {
        this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('token'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    isUserLogged() {
        return this.getTokenInfo() !== null;
    }

    getTokenInfo() {
        let token = localStorage.getItem('token');
        if (token) {
            return jwt_decode(token);
        }
        return null;
    }

    login(username: string, password: string, tenantId: string) {
        return this.doLogin(this.urlEndPoint, username, password, tenantId);
    }

    refreshToken() {
        let headers = this.getHeadersTenancyDefault();
        const user = this.currentUserSubject.value;
        if (!user) {
            return of(null);
        }

        // Genrate params for token refreshing
        const body = new URLSearchParams();
        body.set('tenant_id', user.tenant_id);
        body.set('grant_type', 'refresh_token');
        body.set('refresh_token', user.refresh_token);

        // Save petition options into a variable
        const options = { headers: headers };

        const loginURL = this.urlEndPoint;

        // Execute the request
        return this.http.post(loginURL, body.toString(), options).pipe(map((token: any) => {
            // login successful if there's a jwt token in the response
            if (token && token.jwt) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes                
                localStorage.setItem('token', JSON.stringify(token.jwt));
            }
        }));
    }

    doLogin(loginURL: string, username: string, password: string, tenantId: string) {

        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'X-TenantID': tenantId,
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        let body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', password);

        let options = { headers: headers };

        return this.http.post(loginURL, body.toString(), options)
            .pipe(map((token: any) => {
                // login successful if there's a jwt token in the response
                if (token && token.jwt) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('token', token.jwt);
                    localStorage.setItem('tenantid', tenantId);
                    let info: any = this.getTokenInfo();
                    /* PERMISSION MODULE */
                    /*let authorities = info.authorities;
                    let perm = [];
                    for (let i = 0; i < authorities.length; i++) {
                        perm.push(authorities[i].authority);
                    }
                    let alira = info.alira;
                    let ergo = info.ergo;

                   /* if (alira)
                        perm.push("ALIRA");

                    if (ergo)
                        perm.push("ERGO");
                    
                    this.permissionsService.loadPermissions(perm);*/

                }
            }));
    }

    logout(doRedirect?: boolean) {
        // remove user from local storage to log user out
        localStorage.removeItem('token');
        localStorage.removeItem('tenantid');
        // Redirect user to base login or portal login
        if (doRedirect) {
            this.router.navigate(['/admin']);
        }
    }

    public getHeadersTenancyDefault() {
        let headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'X-TenantID': this.getTenantId(),
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        return headers;
    }

    public getHeadersJsonTenancyDefault() {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-TenantID': this.getTenantId(),
            'Authorization': 'Basic YW5ndWxhcjphbmd1bGFy' // Basic angular - angular
        });
        return headers;
    }

    public getTenantId() {
        return localStorage.getItem('tenantid');
    }

    isTokenExpired(token?: string): boolean {
        if (!token) return true;

        const date = this.getTokenExpirationDate(token);
        if (date === undefined) return false;
        return !(date.valueOf() > new Date().valueOf());
    }

    getTokenExpirationDate(token: string): Date {
        const decoded: any = jwt_decode(token);

        if (decoded.exp === undefined) return null;

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }
}