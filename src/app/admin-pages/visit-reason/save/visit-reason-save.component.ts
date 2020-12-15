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
      plant: [null],
      plantCoordinate: [null],
      isproject: [false],
      email: ["", validateEmail]
    });

    if (this.reasonUrl != null) {
      this.editionMode = true;
      this.reasonService.getReasonByUuid(this.reasonUrl).subscribe((res: Reason) => {
        this.reasonForm.get('name').setValue(res.name);
        this.reasonForm.get('description').setValue(res.description);
        this.reasonForm.get('active').setValue(res.active);
        this.reasonForm.get('isproject').setValue(res.isproject);

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
          this.reasonForm.get('email').disable();
          this.reasonForm.get('isproject').disable();
          this.emailList = resEmails._embedded.reasonProjectEmails;
          this.projectInDb = true;
          if (this.emailList.length >= 1) {
            this.reasonForm.get('email').setValue(this.emailList[0].email);
            for (let i = 1; i < this.emailList.length; i++)
              this.addNewMail(this.emailList[i].email);
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
    let mailList = [];
    let isProject = this.reasonForm.get('isproject').value;
    if (isProject && (defaultEmail.value == null || defaultEmail.value == '')) {
      defaultEmail.setErrors({ incorrect: true, message: "Inserte al menos un correo" });
      return;
    }
    let reason = new Reason();
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    reason.active = this.reasonForm.get('active').value;
    reason.isproject = isProject;
    reason.plantCoordinate = this.reasonForm.get('plantCoordinate').value;

    if (isProject) {
      mailList = [defaultEmail.value.trim()];
      let newMailElement = document.getElementById('newMailId');
      if (newMailElement != undefined) {
        let newMailChilds = newMailElement.children;
        for (let i = 0; i < newMailChilds.length; i++) {
          let input: any = newMailChilds[i].children[0];
          let value = input.value?.trim();
          if (value != "") {
            if (!validateEmailByValue(value)) {
              console.log("no vlido");
              if (input.parentElement.children.length > 1) // delete validations message
                input.parentElement.children[1].innerHTML = null;
              input.classList.add("alert-danger");
              let divElem = document.createElement("div");
              divElem.classList.add("invalid-feedback");
              divElem.innerText = this.translateService.instant('error.invalid.email');
              input.parentElement.insertBefore(divElem, input.nextSibling);
              return;
            } else {
              input.classList.remove("alert-danger");
            }

            for (let i = 0; i < mailList.length; i++) {
              if (mailList[i] == value) {
                console.log(mailList, "duplicado");
                if (input.parentElement.children.length > 1)
                  input.parentElement.children[1].innerHTML = null;
                input.classList.add("alert-danger");
                let divElem = document.createElement("div");
                divElem.classList.add("invalid-feedback");
                divElem.innerText = this.translateService.instant('error.duplicated.email');
                input.parentElement.insertBefore(divElem, input.nextSibling);
                return;
              } else {
                input.classList.remove("alert-danger");
              }
            }
            mailList.push(value);
          }
        }
      }
    }

    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.reasonService.saveReason(this.reasonUrl, reason).subscribe((res: any) => {
      debugger;
      if (isProject && this.reasonUrl == null) { // only create the project for new reasons, not update
        this.reasonService.createProject(res._links.self.href, mailList).subscribe((resProject: any) => {
          debugger;
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


  addNewMail(value = null) {
    let newMailDiv = document.getElementById('newMailId');
    let divElem = document.createElement("div");
    divElem.classList.add("input-group");
    divElem.classList.add("mb-3");
    /*let labelElem = document.createElement("label");
    divElem.appendChild(labelElem);
    labelElem.innerText = "Email";
    labelElem.setAttribute("for", "email"+newMailDiv.children.length+1);*/
    let inputElem = document.createElement("input");
    inputElem.type = "email";
    inputElem.classList.add("form-control");
    inputElem.id = "companymail" + newMailDiv.children.length + 1;
    inputElem.placeholder = this.translateService.instant('user.email');
    if (value != null) {
      inputElem.value = value;
      inputElem.disabled = true;
    }

    divElem.appendChild(inputElem);
    newMailDiv.appendChild(divElem);
  }
}

