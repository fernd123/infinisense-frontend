import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_COMPANY } from 'src/app/shared/constants/app.constants';
import { AuthenticationService } from './authentication.service';
import { Company } from 'src/app/shared/models/company.model';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {


    urlEndPoint: string = BASEURL_DEV_COMPANY;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    createCompany(company: Company, user: User) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('email', company.email);
        body.set('server', company.server);
        body.set('port', company.port);

        body.set('alira', `${company.aliro}`);
        body.set('ergo', `${company.ergo}`);
        body.set('active', `${company.active}`);
        body.set('username', user.username);
        body.set('password', user.password);
        body.set('email', user.email);
        body.set('firstname', user.firstname);
        body.set('lastname', user.lastname);
        body.set('dni', user.dni);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint + '/create', body.toString(), options);

    }

    saveCompany(companyUrl, company: Company) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('email', company.email);
        body.set('server', company.server);
        body.set('port', company.port);
        body.set('aliro', `${company.aliro}`);
        body.set('ergo', `${company.ergo}`);
        body.set('active', `${company.active}`);
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.put(companyUrl, body.toString(), options);
    }

    getData(url) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(url, options);
    }

    getCompany() {
        let options = { headers: this.authService.getHeadersJsonTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getCompanyByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    deleteCompany(companyUrl: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(companyUrl, options);
    }

}