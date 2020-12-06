import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { statusList } from 'src/app/shared/constants/app.constants';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { PlantSensorSaveComponent } from './save/plant-sensor-save.component';
import { LocalDataSource } from 'ng2-smart-table';

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
  public source = new LocalDataSource();

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
          return data;
        }
      },
      sensorId: {
        title: this.translateService.instant('plant.sensorid'),
      },
      status: {
        title: this.translateService.instant('status'),
        type: 'html',
        valuePrepareFunction: (data) => {
          switch (data) {
            case statusList[0].value:
              return `<span class="active">${data}</span>`;
            case statusList[1].value:
              return `<span class="maintenance">${data}</span>`;
            case statusList[2].value:
              return `<span class="outservice">${data}</span>`;
          }
        },
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
    this.plantService.getPlants().subscribe((res: any) => {
      if (res != undefined) {
        this.plantList = res._embedded.plants;
        this.optionFilter.nativeElement.selectedIndex = 0;
        this.refreshList();
      }
    });
  }

  changePlant() {
    this.refreshList();
  }

  refreshList() {
    let selectedIndex = this.optionFilter.nativeElement.selectedIndex;
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    let filter = this.optionFilter != null ? this.plantList[selectedIndex]._links.plantCoordinate.href : this.plantList[0]._links.plantCoordinate.href;
    this.plantCoordsService.getPlantPlaneByPlant(filter, ZoneType.se).subscribe((res: any) => {
      this.data = res._embedded.plantCoordinateses.filter(f => { return f.virtualZoneType == ZoneType.se });
      let getRequest = [];
      let dataUpdate = [];
      for (let i = 0; i < this.data.length; i++) {
        let sensorTypeUrl = this.data[i]._links.sensorType.href;
        getRequest.push(this.plantCoordsService.getData(sensorTypeUrl));
        dataUpdate.push(this.data[i]);
      }
      /* Hacemos todas las peticiones para setear el campo de la relación y actualizar la tabla */
      forkJoin(getRequest).subscribe((res: PlantCoordinates[]) => {
        for (let i = 0; i < res.length; i++) {
          dataUpdate[i].sensorType = res[i].name;
        }
        this.source.load(dataUpdate);
      },
        (error: any) => { console.log(error); });
    });
  }

  public openSaveModal(plantCoordUrl: any): void {
    const modalRef = this.modalService.open(PlantSensorSaveComponent);
    modalRef.componentInstance.plantCoordUrl = plantCoordUrl;

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
        this.openSaveModal(event.data._links.self.href);
        break;
      case 'remove':
        this.plantCoordsService.deleteVirtualZone(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }


}
