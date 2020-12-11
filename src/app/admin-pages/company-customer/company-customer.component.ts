import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EpiService } from 'src/app/core/services/epi.service';
import { Epi } from 'src/app/shared/models/epi.model';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/core/services/company.service';
import { Company } from 'src/app/shared/models/company.model';

@Component({
  selector: 'infini-company',
  templateUrl: './company-customer.component.html',
  styleUrls: ['./company-customer.component.scss']
})
export class CompanyCustomerComponent implements OnInit {

  @ViewChild('modalWindow') modalWindow: any;
  data: Company[];
  reasonForm: FormGroup;
  editionMode: boolean = false;
  titleModal: string;
  companyForm: FormGroup;
  aliro: boolean;
  ergo: boolean;

  constructor(
    private companyService: CompanyService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.companyForm = this.formBuilder.group({
      uuid: [null],
      name: [""],
      description: [""],
      email: [""],
      server: [""],
      port: [""],
      username: [""]
    });
    this.companyForm.disable();

    this.companyService.getCompany().subscribe((res: any) => { //solo una empresa
      this.data = res._embedded.companies;
      if (this.data != null) {
        this.editionMode = true;
        this.companyForm.get('name').setValue(this.data[0].name);
        this.companyForm.get('description').setValue(this.data[0].description);
        this.companyForm.get('email').setValue(this.data[0].email);
        this.companyForm.get('server').setValue(this.data[0].server);
        this.companyForm.get('port').setValue(this.data[0].port);

        this.aliro = this.data[0].aliro;
        this.ergo = this.data[0].ergo;

        this.companyService.getData(this.data[0]._links.user.href).subscribe((resUser: any) => {
          this.companyForm.get('username').setValue(resUser.username);
        });
      }
    });

  }
}
