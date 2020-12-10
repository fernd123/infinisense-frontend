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
  @Input() public companyUrl;

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
      username: ["admin", this.editionMode ? Validators.required : null],
      password: ["", this.editionMode ? Validators.required : null],
      dni: ["", this.editionMode ? Validators.required : null],
      email: ["", this.editionMode ? Validators.required : null],
      firstname: ["", this.editionMode ? Validators.required : null],
      lastname: ["", this.editionMode ? Validators.required : null],
      aliro: [true],
      ergo: [true],
      active: [true]
    });
    if (this.companyUrl != null) {
      this.editionMode = true;
      this.companyForm.get('name').disable();
      this.companyService.getData(this.companyUrl).subscribe((res: Company) => {
        this.companyForm.get('name').setValue(res.name);
        this.companyForm.get('description').setValue(res.description);
        this.companyForm.get('aliro').setValue(res.aliro);
        this.companyForm.get('ergo').setValue(res.ergo);
        this.companyForm.get('active').setValue(res.active);
      });
    }
  }

  submit() {
    this.isLoading = true;
    this.companyForm.disable();
    let company = new Company();
    company.name = this.companyForm.get('name').value;
    company.description = this.companyForm.get('description').value;
    company.aliro = this.companyForm.get('aliro').value;
    company.ergo = this.companyForm.get('ergo').value;
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
        this.isLoading = false;
        //let message = this.translateService.instant(`error.${error.error.message}`);
        this.companyForm.get("name").setErrors({ 'incorrect': true, 'message': 'Ya existe un cliente con el nombre introducido' });
        this.companyForm.enable();
        /*this.alertService.error(`Error, Cliente no creado. ${error}`, options);
        this.editionMode = false;
        this.isLoading = false;
        this.closeModal();*/
      });
    else {
      this.companyService.saveCompany(this.companyUrl, company).subscribe(res => {
        this.modalService.dismissAll("success");
        this.alertService.success(`¡Éxito!, Cliente ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
        this.editionMode = false;
        this.isLoading = false;
        this.companyForm.enable();
      },
        (error: any) => {
          this.isLoading = false;
          //let message = this.translateService.instant(`error.${error.error.message}`);
          this.companyForm.get("name").setErrors({ 'incorrect': true, 'message': 'Ya existe un cliente con el nombre introducido' });
          /*this.alertService.error(`Error, Cliente no creado. ${error}`, options);
          this.editionMode = false;
          this.isLoading = false;
          this.closeModal();*/
          this.companyForm.enable();
        });
    }
  }

  delete() {
    this.companyService.deleteCompany(this.companyUrl).subscribe(res => {
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

