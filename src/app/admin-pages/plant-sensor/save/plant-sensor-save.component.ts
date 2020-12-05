import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { statusList } from 'src/app/shared/constants/app.constants';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Epi } from 'src/app/shared/models/epi.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';


@Component({
  selector: 'infini-plant-sensor-save',
  templateUrl: './plant-sensor-save.component.html'
})
export class PlantSensorSaveComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = this.translate.instant('plant.newcoordinatetitle');
  sensor: string = ZoneType.se;
  zonevirtual: string = ZoneType.zv;
  statusList: any = statusList;
  loaded: boolean = false;
  zoneTypeList: any = [
    { value: "", name: "Tipo de virtualización" },
    { value: ZoneType.zv, name: "Zona" },
    { value: ZoneType.se, name: "Sensor" },
    { value: ZoneType.pe, name: "Punto encuentro" }
  ];

  sensorTypeList: SensorType[];
  editionMode: boolean = false;
  @Input() public plantCoordId;
  @Input() public plantUrl;

  constructor(
    private formBuilder: FormBuilder,
    private sensorTypeService: SensorTypeService,
    private plantCoordService: PlantCoordsService,
    private translate: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.plantCoordsForm = this.formBuilder.group({
      uuid: [null],
      name: ["", Validators.required],
      virtualZoneType: ["", Validators.required],
      sensorType: ["", null],
      coordinates: [""],
      sensorId: [""],
      status: ["Activo", Validators.required]
    });

    this.plantCoordsForm.get('virtualZoneType').disable();
    this.plantCoordsForm.get('sensorType').disable();

    this.sensorTypeService.getSensorTypeList().subscribe((res: SensorType[]) => {
      this.sensorTypeList = res;
    });

    if (this.plantCoordId != null && this.plantCoordId != "") {
      this.plantCoordService.getPlantCoordinateByUuid(this.plantUrl, this.plantCoordId).subscribe((res: PlantCoordinates) => {
        this.plantCoordsForm.get('uuid').setValue(res.uuid);
        this.plantCoordsForm.get('name').setValue(res.name);
        this.plantCoordsForm.get('virtualZoneType').setValue(res.virtualZoneType);
        this.plantCoordsForm.get('sensorType').setValue(res.sensorType?.uuid);
        this.plantCoordsForm.get('sensorId').setValue(res.sensorId);
        this.plantCoordsForm.get('status').setValue(res.status);
      });
    }
  }

  submit() {
    let plantCoords = new PlantCoordinates();
    plantCoords.uuid = this.plantCoordsForm.get('uuid').value;
    plantCoords.name = this.plantCoordsForm.get('name').value;
    plantCoords.sensorType = this.plantCoordsForm.get('sensorType').value;
    plantCoords.sensorId = this.plantCoordsForm.get('sensorId').value;
    plantCoords.status = this.plantCoordsForm.get('status').value;
    plantCoords.virtualZoneType = this.plantCoordsForm.get('virtualZoneType').value;
    plantCoords.coordinates = null;
    plantCoords.plantid = this.plantUrl;

    this.plantCoordService.savePlantVirtual(this.plantUrl, plantCoords).subscribe(res => {
      this.modalService.dismissAll("success");
    });
  }

  delete() {

  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }

  markEpisCheckbox(load = false) {
    /*if (!this.loaded) {
      this.loaded = load;
      let episInput = document.getElementsByClassName('form-check-input');
      if (episInput != undefined) {
        let episList = this.epis != null && this.epis.length > 0 ? this.epis.split(',') : [];
        for (let i = 0; i < episInput.length; i++) {
          let checkbox: any = episInput[i];
          if (episList.includes(checkbox.id)) {
            checkbox.checked = true;
          }
        }
      }
    }*/
  }
}

