import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { PlantService } from 'src/app/core/services/plant.service';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantManagementSaveComponent } from './save/plant-management-save.component';

@Component({
  selector: 'infini-plant-management',
  templateUrl: './plant-management.component.html',
  styleUrls: ['./plant-management.component.scss']
})
export class PlantManagementComponent implements OnInit {

  data: Plant[];
  titleModal: string;
  zonevirtual: ZoneType = ZoneType.zv;
  sensor: ZoneType = ZoneType.se;

  /* Table Settings */
  settings = {
    columns: {
      name: {
        title: this.translateService.instant('plant.plant'),
      },
      location: {
        title: this.translateService.instant('plant.location'),
      },
      phone: {
        title: this.translateService.instant('plant.phone'),
        width: '20%'
      },
      maximumCapacity: {
        title: this.translateService.instant('plant.maximumcapacity'),
        width: '10%'
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>' },
        { name: 'zones', title: '<i class="mdi mdi-map-marker"></i>' },
        { name: 'sensor', title: '<i class="mdi mdi-access-point"></i>' }
      ],
      position: 'right'
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
    private router: Router,
    private translateService: TranslateService,
    private plantService: PlantService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.plantService.getPlants().subscribe((res: Plant[]) => {
      this.data = res;
    });
  }

  public openSaveModal(sensor: any): void {
    const modalRef = this.modalService.open(PlantManagementSaveComponent);
    modalRef.componentInstance.plantId = sensor;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  navigateToPlane(uuid: string, typeConfig: string) {
    this.router.navigateByUrl("/admin-pages/plant-plane", { skipLocationChange: true, queryParams: { plantId: uuid, tenantId: "", type: typeConfig } });
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data.uuid);
        break;
      case 'zones':
        this.navigateToPlane(event.data.uuid, this.zonevirtual);
        break;
      case 'sensor':
        this.navigateToPlane(event.data.uuid, this.sensor);
        break;
    }
  }
}
