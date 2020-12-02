import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { Company } from 'src/app/shared/models/company.model';
import { Reason } from 'src/app/shared/models/reason.model';


@Component({
  selector: 'infini-company-save',
  templateUrl: './company-save.component.html',
  styleUrls: ['./company-save.component.scss']
})
export class CompanySaveComponent implements OnInit {

  companyForm: FormGroup;
  modalTitle: string = this.translateService.instant('company.savetitle');
  editionMode: boolean = false;
  isLoading: boolean = false;
  @Input() public companyId;

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService,
    private route: Router) { }

  ngOnInit() {
    this.companyForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      description: ["", Validators.required],
      active: [true]
    });
    if (this.companyId != null) {
      this.editionMode = true;
      this.companyService.getCompanyByUuid(this.companyId).subscribe((res: Company) => {
        this.companyForm.get('uuid').setValue(res.uuid);
        this.companyForm.get('name').setValue(res.name);
        this.companyForm.get('description').setValue(res.description);
        this.companyForm.get('active').setValue(res.active);
      });
    }
  }

  submit() {
    this.isLoading = true;
    let company = new Company();
    company.uuid = this.companyForm.get('uuid').value;
    company.name = this.companyForm.get('name').value;
    company.description = this.companyForm.get('description').value;
    company.active = this.companyForm.get('active').value;
    debugger;

    if (!this.editionMode)
      this.companyService.createCompany(company).subscribe(res => {
        this.modalService.dismissAll("success");
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.success(`¡Éxito!, Cliente ${this.editionMode ? 'creado' : 'creado'} correctamente`, options);
        this.editionMode = false;
        this.isLoading = false;
      });
    else {
      this.companyService.saveCompany(company).subscribe(res => {
        this.modalService.dismissAll("success");
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.success(`¡Éxito!, EPI ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
        this.editionMode = false;
        this.isLoading = false;
      });
    }
  }

  delete() {
    let uuid = this.companyForm.get('uuid').value;
    this.companyService.deleteCompany(uuid).subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Motivo de visita eliminado correctamente`, options);
      this.editionMode = false;
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

