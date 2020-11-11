import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BASEURL_DEV_USER } from 'src/app/shared/constants/app.constants';


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

        const loginURL = this.urlEndPoint + "/"+ dni;

        // Execute the request
        return this.http.get(loginURL, options);
    }

    getUserSignature(uuid: any) {
        const tokenHeaders = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic YW5ndWxhcjphbmd1bGFy`
        });

        // Save petition options into a variable
        const options = { headers: tokenHeaders};

        const loginURL = this.urlEndPoint + "/"+ uuid +"/signature";

        // Execute the request
        return this.http.get(loginURL, {responseType : 'text' });
      }
}