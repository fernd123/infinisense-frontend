import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantVirtualization.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { PlantVirtualization } from 'src/app/shared/models/plantvirtualization.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-sensor-type-save',
  templateUrl: './sensor-type-save.component.html'
})
export class SensorTypeSaveComponent implements OnInit {

  sensorTypeForm: FormGroup;
  modalTitle: string = "Guardar Tipo de Sensor";
  editionMode: boolean = false;
  @Input() public sensorTypeId;

  constructor(
    private formBuilder: FormBuilder,
    private sensorTypeService: SensorTypeService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: Router) { }

  ngOnInit() {
    this.sensorTypeForm = this.formBuilder.group({
      uuid: [""],
      name: ["", Validators.required],
      description: [null, Validators.required],
      active: [true]
    });
    if (this.sensorTypeId != null) {
      this.editionMode = true;
      this.sensorTypeService.getSensorTypeByUuid(this.sensorTypeId, "").subscribe((res: SensorType) => {
        this.sensorTypeForm.get('uuid').setValue(res.uuid);
        this.sensorTypeForm.get('name').setValue(res.name);
        this.sensorTypeForm.get('description').setValue(res.description);
        this.sensorTypeForm.get('active').setValue(res.active);
      });

    }
  }

  submit() {
    let sensorType = new SensorType();
    sensorType.uuid = this.sensorTypeForm.get('uuid').value;
    sensorType.name = this.sensorTypeForm.get('name').value;
    sensorType.description = this.sensorTypeForm.get('description').value;
    sensorType.active = this.sensorTypeForm.get('active').value;
    this.sensorTypeService.saveSensorType(sensorType, "").subscribe(res => {
      this.modalService.dismissAll("success");
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.alertService.success(`¡Éxito!, Tipo de sensor ${this.editionMode ? 'actualizado' : 'guardado'} correctamente`, options);
      this.editionMode = false;
    });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

