import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { statusList } from 'src/app/shared/constants/app.constants';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { PlantSensorSaveComponent } from './save/plant-sensor-save.component';

@Component({
  selector: 'infini-plant-sensor',
  templateUrl: './plant-sensor.component.html',
  styleUrls: ['./plant-sensor.component.scss']
})
export class PlantSensorComponent implements OnInit {

  reasonForm: FormGroup;
  plantList: Plant[] = [];
  data: PlantCoordinates[] = [];
  selectedPlantUuid: string;

  @ViewChild('modalWindow') modalWindow: any;
  @ViewChild('optionFilter') optionFilter: any;
  optionValue: string;

  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

  /* Table Settings */
  settings = {
    columns: {
      name: {
        title: this.translateService.instant('name'),
        width: '20%'
      },
      sensorType: {
        title: this.translateService.instant('plant.sensortype'),
        valuePrepareFunction: (data) => {
          return data.name;
        },
      },
      sensorId: {
        title: this.translateService.instant('plant.sensorid'),
      },
      status: {
        title: this.translateService.instant('status'),
        filter: {
          type: 'list',
          config: {
            selectText: this.translateService.instant('status'),
            list: statusList,
          },
        },
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>' },
        { name: 'remove', title: '<i class="mdi mdi-delete"></i>' }
      ],
      position: 'right'
    },
    edit: {
      editButtonContent: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>'
    },
    attr: {
      class: 'table table-bordered'
    },
    rowClassFunction: (row) => {
      // row css
    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  constructor(
    private plantService: PlantService,
    private plantCoordsService: PlantCoordsService,
    private translateService: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.plantService.getPlants("").subscribe((res: Plant[]) => {
      if (res != undefined) {
        this.plantList = res;
        this.optionFilter.nativeElement.selectedIndex = 0;
        this.refreshList();
      }
    });
  }

  changePlant() {
    this.refreshList();
  }

  refreshList() {
    try {
      let selectedIndex = this.optionFilter.nativeElement.selectedIndex;
      if (selectedIndex < 0) {
        selectedIndex = 0;
      }
      let filter = this.optionFilter != null ? this.plantList[selectedIndex].uuid : this.plantList[0].uuid;
      this.plantCoordsService.getPlantPlaneByPlant(filter, ZoneType.se, "").subscribe((res: PlantCoordinates[]) => {
        this.data = res;
      });
    } catch (ex) {

    }
  }

  public openSaveModal(plantCoordId: any): void {
    const modalRef = this.modalService.open(PlantSensorSaveComponent);
    modalRef.componentInstance.plantCoordId = plantCoordId;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.reasonForm.reset();
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data.uuid);
        break;
      case 'remove':
        this.plantCoordsService.deleteVirtualZone(event.data.uuid, "").subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }


}
