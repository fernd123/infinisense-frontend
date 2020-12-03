import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { CompanyService } from 'src/app/core/services/company.service';
import { Company } from 'src/app/shared/models/company.model';
import { User } from 'src/app/shared/models/user.model';


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
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.companyForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      description: ["", Validators.required],
      username: ["admin", Validators.required],
      password: ["", Validators.required],
      dni: ["", Validators.required],
      email: ["", Validators.required],
      firstname: ["", Validators.required],
      lastname: ["", Validators.required],
      alira: [true],
      infinisense: [true],
      active: [true]
    });
    if (this.companyId != null) {
      this.editionMode = true;
      this.companyForm.get('name').disable();
      this.companyService.getCompanyByUuid(this.companyId).subscribe((res: Company) => {
        this.companyForm.get('uuid').setValue(res.uuid);
        this.companyForm.get('name').setValue(res.name);
        this.companyForm.get('description').setValue(res.description);
        this.companyForm.get('alira').setValue(res.alira);
        this.companyForm.get('infinisense').setValue(res.infinisense);
        this.companyForm.get('active').setValue(res.active);
      });
    }
  }

  submit() {
    this.isLoading = true;
    this.companyForm.disable();
    let company = new Company();
    company.uuid = this.companyForm.get('uuid').value;
    company.name = this.companyForm.get('name').value;
    company.description = this.companyForm.get('description').value;
    company.alira = this.companyForm.get('alira').value;
    company.infinisense = this.companyForm.get('infinisense').value;
    company.active = this.companyForm.get('active').value;

    let user = new User();
    user.username = this.companyForm.get('username').value;
    user.password = this.companyForm.get('password').value;
    user.email = this.companyForm.get('email').value;
    user.firstname = this.companyForm.get('firstname').value;
    user.lastname = this.companyForm.get('lastname').value;
    user.dni = this.companyForm.get('dni').value;

    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    if (!this.editionMode)
      this.companyService.createCompany(company, user).subscribe(res => {
        this.modalService.dismissAll("success");
        this.alertService.success(`¡Éxito!, Cliente ${this.editionMode ? 'creado' : 'creado'} correctamente`, options);
        this.editionMode = false;
        this.isLoading = false;
        this.companyForm.enable();
      }, error => {
        this.alertService.error(`Error, Cliente no creado. ${error}`, options);
        this.editionMode = false;
        this.isLoading = false;
        this.companyForm.enable();
        this.closeModal();
      });
    else {
      this.companyService.saveCompany(company).subscribe(res => {
        this.modalService.dismissAll("success");
        this.alertService.success(`¡Éxito!, Cliente ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
        this.editionMode = false;
        this.isLoading = false;
        this.companyForm.enable();
      },
        error => {
          this.alertService.error(`Error, Cliente no creado. ${error}`, options);
          this.editionMode = false;
          this.isLoading = false;
          this.companyForm.enable();
          this.closeModal();
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

