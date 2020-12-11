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

  plantList: Plant[];
  plantZoneList: PlantCoordinates[];

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
      isproject: [false]
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
    let reason = new Reason();
    reason.name = this.reasonForm.get('name').value;
    reason.description = this.reasonForm.get('description').value;
    reason.active = this.reasonForm.get('active').value;
    reason.isproject = this.reasonForm.get('isproject').value;
    reason.plantCoordinate = this.reasonForm.get('plantCoordinate').value;

    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.reasonService.saveReason(this.reasonUrl, reason).subscribe((res: any) => {
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
}

