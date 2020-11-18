import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantVirtualization.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantVirtualization } from 'src/app/shared/models/plantvirtualization.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-plant-management-save',
  templateUrl: './plant-management-save.component.html'
})
export class PlantManagementSaveComponent implements OnInit {

  plantForm: FormGroup;
  modalTitle: string = "Guardar Info. Planta";
  editionMode: boolean = false;
  @Input() public plantId;

  constructor(
    private formBuilder: FormBuilder,
    private plantService: PlantService,
    private sensorTypeService: SensorTypeService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: Router) { }

  ngOnInit() {
    this.plantForm = this.formBuilder.group({
      uuid: [null],
      name: [null, Validators.required],
      location: [null, Validators.required],
      phone: [null, Validators.required],
      alternativePhone: [""],
      maximumCapacity: [null, Validators.required]
    });

    if (this.plantId != null) {
      this.editionMode = true;
      this.plantService.getPlantByUuid(this.plantId, "").subscribe((res: Plant) => {
        this.plantForm.get('uuid').setValue(res.uuid);
        this.plantForm.get('name').setValue(res.name);
        this.plantForm.get('location').setValue(res.location);
        this.plantForm.get('phone').setValue(res.phone);
        this.plantForm.get('alternativePhone').setValue(res.alternativePhone);
        this.plantForm.get('maximumCapacity').setValue(res.maximumCapacity);
      });
    }
  }

  hasFormError(formName: string) {
    let element = this.plantForm.get(formName);
    return element.touched && element.invalid; //&& (element.value == null || element.value == '');
  }

  submit() {
    let plant = new Plant();
    plant.uuid = this.plantForm.get('uuid').value;
    plant.name = this.plantForm.get('name').value;
    plant.location = this.plantForm.get('location').value;
    plant.phone = this.plantForm.get('phone').value;
    plant.alternativePhone = this.plantForm.get('alternativePhone').value;
    plant.maximumCapacity = this.plantForm.get('maximumCapacity').value;

    this.plantService.savePlant(plant, "").subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Planta ${this.editionMode ? 'actualizada' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    });
  }

  delete() {
    /*this.plantService.deletePlant(this.plantId, this.selectedAreaId).subscribe(res => {
      this.modalService.dismissAll("success");
    });*/
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

