import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { Reason } from 'src/app/shared/models/reason.model';


@Component({
  selector: 'infini-company-save',
  templateUrl: './company-save.component.html'
})
export class CompanySaveComponent implements OnInit {

  companyForm: FormGroup;
  modalTitle: string = this.translateService.instant('company.savetitle');
  editionMode: boolean = false;
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
  }

  submit() {
    let reason = new Reason();
    reason.uuid = this.companyForm.get('uuid').value;
    reason.name = this.companyForm.get('name').value;
    reason.description = this.companyForm.get('description').value;
    reason.active = this.companyForm.get('active').value;

    if (!this.editionMode)
      this.companyService.createCompany(reason).subscribe(res => {
        this.modalService.dismissAll("success");
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.success(`¡Éxito!, Cliente ${this.editionMode ? 'creado' : 'creado'} correctamente`, options);
        this.editionMode = false;
      });
    else {
      this.companyService.saveCompany(reason).subscribe(res => {
        this.modalService.dismissAll("success");
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        this.alertService.success(`¡Éxito!, EPI ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
        this.editionMode = false;
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

