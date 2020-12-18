import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { Reason } from 'src/app/shared/models/reason.model';
import { ReasonProjectEmail } from 'src/app/shared/models/reasonProjectEmail.model';
import { validateEmail, validateEmailByValue } from 'src/app/shared/form-validators/email.validator';


@Component({
  selector: 'infini-visit-reason-save',
  templateUrl: './visit-reason-save.component.html'
})
export class VisitReasonSaveComponent implements OnInit {

  reasonForm: FormGroup;
  modalTitle: string = "Guardar Motivo Visita";
  editionMode: boolean = false;
  @Input() public reasonUrl;
  associationtitle: string = this.translateService.instant('reason.associatetozone');
  projectInDb: boolean = false;

  plantList: Plant[];
  plantZoneList: PlantCoordinates[];
  emailList: ReasonProjectEmail[];

  constructor(
    private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private plantService: PlantService,
    private plantZoneService: PlantCoordsService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private translateService: TranslateService
  ) { }

  ngOnInit() {

    /* Load Data */
    this.loadData();

    this.reasonForm = this.formBuilder.group({
      name: ["", Validators.required],
      description: [""],
      active: [true],
      finished: [false],
      plant: [null],
      plantCoordinate: [null],
      isproject: [false],
      company: [""],
      email: ["", validateEmail]
    });

    if (this.reasonUrl != null) {
      this.editionMode = true;
      this.reasonService.getReasonByUuid(this.reasonUrl).subscribe((res: Reason) => {
        this.reasonForm.get('name').setValue(res.name);
        this.reasonForm.get('description').setValue(res.description);
        this.reasonForm.get('active').setValue(res.active);
        this.reasonForm.get('isproject').setValue(res.isproject);
        this.reasonForm.get('finished').setValue(res.finished);
        //this.reasonForm.get('finished').disable();

        let plantCoordinate = res._links.plantCoordinate.href;
        this.reasonService.getReasonByUuid(plantCoordinate).subscribe((resPlantCoord: any) => {
          let plantUrl = resPlantCoord._links.plant.href;
          this.reasonService.getReasonByUuid(plantUrl).subscribe((resPlant: any) => {
            this.reasonForm.get('plant').setValue(resPlant._links.plantCoordinate.href);
            this.reasonForm.get('plantCoordinate').setValue(resPlantCoord._links.self.href);
            this.loadPlantZone();
          })
        }, (error => {

        }));

        this.reasonService.getReasonByUuid(res._links.reasonProjectEmail.href).subscribe((resEmails: any) => {
          this.reasonForm.get('company').disable();
          this.reasonForm.get('email').disable();
          this.reasonForm.get('isproject').disable();
          this.emailList = resEmails._embedded.reasonProjectEmails;
          this.projectInDb = true;
          if (this.emailList.length >= 1) {
            this.reasonForm.get('company').setValue(this.emailList[0].company);
            this.reasonForm.get('email').setValue(this.emailList[0].email);
            for (let i = 1; i < this.emailList.length; i++)
              this.addNewMail(this.emailList[i]);
          }
        });
      });
    }
  }

  loadData() {
    this.plantService.getPlants().subscribe((res: any) => {
      this.plantList = res._embedded.plants;
    });
  }

  loadPlantZone(removePlantZone = false) {
    let selectedPlantCoordsUrl = this.reasonForm.get('plant').value;
    this.plantZoneService.getPlantPlaneByPlant(selectedPlantCoordsUrl, ZoneType.zv).subscribe((res: any) => {
      this.plantZoneList = res._embedded.plantCoordinateses;
      if (removePlantZone) {
        this.reasonForm.get('plantCoordinate').setValue(null);
      }
    });
  }

  submit() {
    let defaultEmail = this.reasonForm.get('email');
    let defaultCompany = this.reasonForm.get('company');

    let mailList = [];
    let companyList = [];

    let isProject = this.reasonForm.get('isproject').value;
    if (isProject && (defaultCompany.value == null || defaultCompany.value == '')) {
      defaultCompany.setErrors({ incorrect: true, message: "Inserte al menos una empresa" });
      return;
    }

    if (isProject && (defaultEmail.value == null || defaultEmail.value == '')) {
      defaultEmail.setErrors({ incorrect: true, message: "Inserte al menos un correo" });
      return;
    }

    let reason = new Reason();
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    reason.active = this.reasonForm.get('active').value;
    reason.finished = this.reasonForm.get('finished').value;
    reason.isproject = isProject;
    reason.plantCoordinate = this.reasonForm.get('plantCoordinate').value;

    if (isProject) {
      mailList = [defaultEmail.value.trim()]; // default mail
      companyList = [defaultCompany.value.trim()]; // default mail

      let newMailElement = document.getElementById('newMailId');
      if (newMailElement != undefined) {
        let newMailChilds = newMailElement.children;
        for (let i = 0; i < newMailChilds.length; i++) {
          let inputCompany: any = newMailChilds[i].children[0].children[1];
          let inputEmail: any = newMailChilds[i].children[1].children[1];
          let valueCompany = inputCompany.value?.trim();
          let valueEmail = inputEmail.value?.trim();

          // Clear class error
          inputCompany.classList.remove("alert-danger");
          inputEmail.classList.remove("alert-danger");

          // Delete errors if exists
          inputCompany.parentElement.children.length == 3 ?
            inputCompany.parentElement.children[2].remove() : null;
          inputEmail.parentElement.children.length == 3 ?
            inputEmail.parentElement.children[2].remove() : null;

          // Company check
          if (valueCompany == "") {
            this.createDivError(inputEmail, this.translateService.instant('error.empty.value'));
            return;
          }

          if (valueEmail != "") {
            if (!validateEmailByValue(valueEmail)) { // If email is not valid format
              this.createDivError(inputCompany, this.translateService.instant('error.empty.value'));
              return;
              /*inputEmail.classList.add("alert-danger");
              let divElem = document.createElement("div");
              divElem.classList.add("invalid-feedback");
              divElem.innerText = this.translateService.instant('error.invalid.email');
              inputEmail.parentElement.insertBefore(divElem, inputEmail.nextSibling);
              return;*/
            }

            for (let i = 0; i < mailList.length; i++) {
              if (mailList[i] == valueEmail) { // If email extists in list
                this.createDivError(inputEmail, this.translateService.instant('error.duplicated.email'));
                return;
              } else {
                inputEmail.classList.remove("alert-danger");
              }
            }
            companyList.push(valueCompany);
            mailList.push(valueEmail);
          } else { // empty value
            this.createDivError(inputEmail, this.translateService.instant('error.empty.value'));
            return;
          }
        }
      }
    }

    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.reasonService.saveReason(this.reasonUrl, reason).subscribe((res: any) => {
      if (isProject && this.reasonUrl == null) { // only create the project for new reasons, not update
        this.reasonService.createProject(res._links.self.href, mailList, companyList).subscribe((resProject: any) => {

        })
      }

      if (reason.plantCoordinate != null) {
        this.reasonService.assignCoordinateToReason(res._links.plantCoordinate.href, reason.plantCoordinate).subscribe(res => {
          this.modalService.dismissAll("success");

          this.alertService.success(`¡Éxito!, motivo ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
          this.editionMode = false;
        }),
          ((error: any) => {
            let message = this.translateService.instant(`error.${error.error.message}`);
            this.reasonForm.get(error.error.fieldName).setErrors({ 'incorrect': true, 'message': message });
          });
      } else {
        this.reasonService.deleteCoordinateReason(res._links.plantCoordinate.href).subscribe(res => {
          this.modalService.dismissAll("success");
          this.alertService.success(`¡Éxito!, motivo ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
          this.editionMode = false;
        })
      }
    },
      (error: any) => {
        let message = this.translateService.instant(`error.${error.error.message}`);
        this.reasonForm.get(error.error.fieldName).setErrors({ 'incorrect': true, 'message': message });
      })
  }

  delete() {
    this.reasonService.deleteReason(this.reasonUrl).subscribe(res => {
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


  addNewMail(reasonProjectEmail = null) {
    let newMailDiv = document.getElementById('newMailId');

    // Form row
    let divElem = document.createElement("div");
    divElem.classList.add("form-row");

    // col-md-3 mb-3
    let inputDivElem = document.createElement('div');
    inputDivElem.classList.add('col-md-6');
    inputDivElem.classList.add("mb-3");
    divElem.appendChild(inputDivElem);

    // label company
    let labelElem = document.createElement("label");
    labelElem.innerText = "Empresa";
    labelElem.setAttribute("for", "company" + newMailDiv.children.length + 1);
    inputDivElem.appendChild(labelElem);

    // Company input
    let inputCompanyElem = document.createElement("input");
    inputCompanyElem.type = "text";
    inputCompanyElem.classList.add("form-control");
    inputCompanyElem.id = "company" + newMailDiv.children.length + 1;
    inputCompanyElem.placeholder = this.translateService.instant('user.company');
    if (reasonProjectEmail != null) {
      inputCompanyElem.value = reasonProjectEmail.company;
      inputCompanyElem.disabled = true;
    }
    inputDivElem.appendChild(inputCompanyElem);
    // col-md-3 mb-3
    let inputDivEmailElem = document.createElement('div');
    inputDivEmailElem.classList.add('col-md-6');
    inputDivEmailElem.classList.add("mb-3");
    divElem.appendChild(inputDivEmailElem);

    // label email
    let labelEmailElem = document.createElement("label");
    labelEmailElem.innerText = "Email";
    labelEmailElem.setAttribute("for", "email" + newMailDiv.children.length + 1);
    inputDivEmailElem.appendChild(labelEmailElem);

    let inputEmailElem = document.createElement("input");
    inputEmailElem.type = "email";
    inputEmailElem.classList.add("form-control");
    inputEmailElem.id = "companymail" + newMailDiv.children.length + 1;
    inputEmailElem.placeholder = this.translateService.instant('user.email');
    if (reasonProjectEmail != null) {
      inputEmailElem.value = reasonProjectEmail.email;
      inputEmailElem.disabled = true;
    }
    inputDivEmailElem.appendChild(inputEmailElem);

    newMailDiv.appendChild(divElem);
  }

  createDivError(element, message) {
    element.classList.add("alert-danger");
    let divElem = document.createElement("div");
    divElem.classList.add("invalid-feedback");
    divElem.innerText = message;
    element.parentElement.insertBefore(divElem, element.nextSibling);
  }
}

