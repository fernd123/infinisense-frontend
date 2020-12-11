import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import jwt_decode from "jwt-decode";
import { AuthenticationService } from '../services/authentication.service';
import { aliroAccess, ergoAccess } from 'src/app/shared/constants/app.constants';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        private authService: AuthenticationService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('token')) {
            let token = localStorage.getItem('token');
            let tokenInfo: any = this.authService.getTokenInfo();
            // token expired
            if (this.isTokenExpired(token)) {
                localStorage.clear();
                this.router.navigate(['/admin']);
                return false;
            }

            let component = route.routeConfig.path;
            let aliro = tokenInfo.aliro;
            let ergo = tokenInfo.ergo;

            let aliroPlatform = aliroAccess.find(f => { if (f == component) return component });
            let ergoPlatform = ergoAccess.find(f => { if (f == component) return component });

            /* Si tengo acceso a ambas plataformas, true */
            if(aliro && ergo){
                return true;
            }
            
            /* Si el componente forma parte de aliro y no tengo acceso, reedireccionar a dashboard */
            if (!aliro && aliroPlatform != undefined) {
                this.router.navigate(['/dashboard']);
                return false;
            }

            /* Si el componente forma parte de ergo y no tengo acceso, reedireccionar a dashboard */
            if (!ergo && ergoPlatform != undefined) {
                this.router.navigate(['/dashboard']);
                return false;
            }

            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/admin']);
        return false;
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