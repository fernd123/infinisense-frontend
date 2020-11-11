import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authenticationService: AuthenticationService) { }
    realoding = 0;

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401  && !this.router.url.endsWith('/login')) {
                if (this.realoding > 15 || err.error.error_description.startsWith("Invalid refresh token (expired): ")) {
                    this.authenticationService.logout(true);
                    return throwError(err);
                }
                // auto logout if 401 response returned from api
                this.realoding++;
                return this.authenticationService.refreshToken().pipe(
                    switchMap((res) => {
                        request = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${res.access_token}`
                            }
                        });
                        this.realoding = 0;
                        return next.handle(request);
                    })
                );
            }
            // const error = err.errerr.error.message || err.statusText;
            return throwError(err);
        }));
    }
}
