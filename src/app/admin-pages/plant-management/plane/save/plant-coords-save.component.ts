import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { EpiService } from 'src/app/core/services/epi.service';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { BASEURL_DEV_PLANTCOORDINATES, statusList } from 'src/app/shared/constants/app.constants';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Epi } from 'src/app/shared/models/epi.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';

@Component({
  selector: 'infini-plant-coords-save',
  templateUrl: './plant-coords-save.component.html'
})
export class PlantCoordsSaveComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = this.translate.instant('plant.newcoordinatetitle');
  zonevirtual: ZoneType = ZoneType.zv;
  sensor: ZoneType = ZoneType.se;
  zoneTypeList: any = [
    { value: "", name: "Tipo de virtualización" },
    { value: ZoneType.zv, name: "Zona" },
    { value: ZoneType.se, name: "Sensor" },
    { value: ZoneType.ru, name: "Ruta" },
    { value: ZoneType.pe, name: "Punto encuentro" }
  ];

  statusList: any = [
    { value: "Activo", name: "Activo" },
    { value: "Mantenimiento", name: "Mantenimiento" },
    { value: "Fuera de Servicio", name: "Fuera de Servicio" }
  ];

  sensorTypeList: SensorType[];
  epiList: Epi[];
  /*epiList: any[] = [
    { value: "casco", name: "Casco" },
    { value: "guante", name: "Guantes" },
    { value: "mascarilla1", name: "Mascarilla FFP2" },
    { value: "chaleco", name: "Chaleco reflectante" },
    { value: "botas", name: "Botas" }
  ]*/

  @Input() public selectedAreaId;
  @Input() public plantUrl;
  @Input() public coordinates;
  @Input() public sensorTypeId;
  @Input() public typeConfig;
  @Input() public initialArea;
  @Input() public finalArea;
  @Input() public selection: boolean = false;
  @Input() public plantCoordinateUrlFromTable: string;

  epis: string;
  loaded = false;
  public plantCoordinateUrl;


  constructor(
    private formBuilder: FormBuilder,
    private plantCoordService: PlantCoordsService,
    private sensorTypeService: SensorTypeService,
    private imageMapCreatorService: ImageMapCreatorService,
    private translate: TranslateService,
    private epiService: EpiService,
    private alertService: AlertService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.plantCoordsForm = this.formBuilder.group({
      name: ["", Validators.required],
      virtualZoneType: ["", Validators.required],
      sensorType: ["", null],
      coordinates: [""],
      sensorId: [""],
      status: [statusList[0].value]
    });

    /* Load epis */
    this.epiService.getEpis().subscribe((res: any) => {
      this.epiList = res._embedded.epis;
    });

    let jsonDataCoords = null;
    if (this.coordinates != null)
      jsonDataCoords = JSON.parse(this.coordinates);

    if (jsonDataCoords != null && jsonDataCoords.type != "") {
      this.typeConfig = jsonDataCoords.type;
    }

    if (this.typeConfig == null) {
      this.typeConfig = this.imageMapCreatorService.getImageMapCreator().typeConfig;
    }

    if (this.typeConfig == ZoneType.ru) {
      // Get initial area and final area
      let getInitialArea = this.plantCoordService.getPlantCoordinateByUuid(this.plantUrl, this.initialArea);
      let getFinalArea = this.plantCoordService.getPlantCoordinateByUuid(this.plantUrl, this.finalArea);

      forkJoin([getInitialArea, getFinalArea]).subscribe((res: any) => {
        let initialArea = res[0];
        let finalArea = res[1];
        this.plantCoordsForm.get('name').setValue(`${initialArea.name} - ${finalArea.name}`);
      });
      this.plantCoordsForm.get('name').disable();
    }

    if (this.typeConfig == ZoneType.se)
      this.sensorTypeService.getSensorTypeList().subscribe((res: any) => {
        this.sensorTypeList = res._embedded.sensorTypes;
      });

    this.plantCoordsForm.get('virtualZoneType').setValue(this.typeConfig);
    /* Type of zone selected by user action in UI */
    this.plantCoordsForm.get('virtualZoneType').disable();
    this.plantCoordsForm.get('sensorType').disable();
    // Al arrastrar el elemento se pone el ID, sino es null (para editar)
    this.plantCoordsForm.get('sensorType').setValue(this.sensorTypeId);

    /* Selected area in plane */
    if (this.selectedAreaId != null && this.selectedAreaId != "") {
      this.plantCoordService.getPlantCoordinateByUuid(this.plantUrl, this.selectedAreaId).subscribe((res: PlantCoordinates) => {
        this.setFormValues(res);
      });
    }

    /* Selected area in table list left */
    else
      if (this.plantCoordinateUrlFromTable != null && this.plantCoordinateUrlFromTable != "") {
        this.plantCoordService.getData(this.plantCoordinateUrlFromTable).subscribe((res: PlantCoordinates) => {
          this.setFormValues(res);
        });
      }
  }

  private setFormValues(res: any) {
    this.plantCoordinateUrl = res._links.self.href;
    this.plantCoordsForm.get('name').setValue(res.name);
    this.plantCoordsForm.get('virtualZoneType').setValue(res.virtualZoneType);
    this.plantCoordsForm.get('sensorId').setValue(res.sensorId);
    this.plantCoordsForm.get('status').setValue(res.status);
    if (!this.selection) {
      this.coordinates = res.coordinates;
    }
    if (this.typeConfig == ZoneType.se) {
      this.plantCoordService.getData(res._links.sensorType.href).subscribe((res: any) => {
        this.plantCoordsForm.get('sensorType').setValue(res._links.self.href);
      })
    }
    this.epis = res.epis;
  }

  markEpisCheckbox(load = false) {
    if (!this.loaded) {
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
    }
  }

  submit() {
    let plantCoords = new PlantCoordinates();
    plantCoords.uuid = this.selectedAreaId;
    plantCoords.name = this.plantCoordsForm.get('name').value;
    plantCoords.sensorType = this.plantCoordsForm.get('sensorType').value;
    plantCoords.sensorId = this.plantCoordsForm.get('sensorId').value;
    plantCoords.virtualZoneType = this.plantCoordsForm.get('virtualZoneType').value;
    plantCoords.status = this.plantCoordsForm.get('status').value;
    plantCoords.coordinates = this.coordinates;


    let epis = document.getElementsByClassName('form-check-input');
    let selectedEpis = "";
    if (epis != undefined) {
      for (let i = 0; i < epis.length; i++) {
        let checkbox: any = epis[i];
        if (checkbox.checked) {
          selectedEpis += checkbox.id + ",";
        }
      }
      selectedEpis = selectedEpis.substr(0, selectedEpis.length - 1);
    }
    plantCoords.epis = selectedEpis;

    this.plantCoordService.savePlantVirtual(this.plantCoordinateUrl, plantCoords).subscribe((res: any) => {
      this.plantCoordService.associateRelation(this.plantUrl, res._links.plant.href).subscribe((resAssociation: any) => {

        if (this.typeConfig == ZoneType.ru) {
          let plantInitUrl = BASEURL_DEV_PLANTCOORDINATES + "/" + this.initialArea;
          let plantFinalUrl = BASEURL_DEV_PLANTCOORDINATES + "/" + this.finalArea;

          this.plantCoordService.associateRelation(plantInitUrl, res._links.initCoordinate.href).subscribe(resAssInit => {
            this.plantCoordService.associateRelation(plantFinalUrl, res._links.endCoordinate.href).subscribe(resAssEnd => {
            });
          });

          /*forkJoin([initCoordinateReq, endCoordinateReq]).subscribe((res: any) => {
          });*/
        }

        if (this.typeConfig == ZoneType.se) {
          this.plantCoordService.associateRelation(this.plantCoordsForm.get('sensorType').value, res._links.sensorType.href).subscribe((resSensorAssociation: any) => {
          });
        }
        this.modalService.dismissAll("success");
      });
    });
  }

  delete() {
    this.plantCoordService.deleteVirtualZone(this.plantCoordinateUrl).subscribe(res => {
      this.modalService.dismissAll("success");
    },
      (error: any) => {
        let options = {
          autoClose: true,
          keepAfterRouteChange: true
        };
        if (error.error.message = 'Data Integrity')
          this.alertService.error(`Error, No se puede eliminar el elemento porque tiene datos relacionados`, options);
      });
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }
}

