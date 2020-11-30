import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_LOGIN } from 'src/app/shared/constants/app.constants';

@Injectable()
export class LoginAdminService {

    headers = new HttpHeaders({
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        'X-TenantID': localStorage.getItem('tenantid'),
        'Authorization': "Basic YW5ndWxhcjphbmd1bGFy"
    });

    constructor(private http: HttpClient) { /* console.log('login service init') */ }

    urlEndPoint: string = BASEURL_DEV_LOGIN;

    login(username: string, password: string) {



        let body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', password);


        let options = { headers: this.headers };

        return this.http.post(this.urlEndPoint, body.toString(), options);
    }
}
