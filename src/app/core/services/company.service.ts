import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASEURL_DEV_COMPANY } from 'src/app/shared/constants/app.constants';
import { Epi } from 'src/app/shared/models/epi.model';
import { AuthenticationService } from './authentication.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { Company } from 'src/app/shared/models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {


    urlEndPoint: string = BASEURL_DEV_COMPANY;

    constructor(private http: HttpClient,
        private authService: AuthenticationService) { }

    createCompany(company: Company) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('active', `${company.active}`);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        return this.http.post(this.urlEndPoint + '/create', body.toString(), options);

    }

    saveCompany(company: Company) {
        let body = new URLSearchParams();
        body.set('name', company.name);
        body.set('description', company.description);
        body.set('active', `${company.active}`);

        let options = { headers: this.authService.getHeadersTenancyDefault() };

        if (company.uuid == null) {
            return this.http.post(this.urlEndPoint, body.toString(), options);
        } else {
            return this.http.put(this.urlEndPoint + "/" + company.uuid, body.toString(), options);
        }
    }

    getCompany() {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint, options);
    }

    getCompanyByUuid(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.get(this.urlEndPoint + "/" + uuid, options);
    }

    deleteCompany(uuid: string) {
        let options = { headers: this.authService.getHeadersTenancyDefault() };
        return this.http.delete(this.urlEndPoint + "/" + uuid, options);
    }

}