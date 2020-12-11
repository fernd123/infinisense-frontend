import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
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
  aliro: boolean = false;
  ergo: boolean = false;

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
    private authService: AuthenticationService,
    private plantService: PlantService,
    private modalService: NgbModal) { }

  ngOnInit() {
    // User data
    let data: any = this.authService.getTokenInfo();
    this.aliro = data.aliro;
    this.ergo = data.ergo;
    this.refreshList();
  }

  refreshList() {
    this.plantService.getPlants().subscribe((res: any) => {
      this.data = res._embedded.plants;
    });
  }

  public openSaveModal(plantUrl: any): void {
    const modalRef = this.modalService.open(PlantManagementSaveComponent);
    modalRef.componentInstance.plantUrl = plantUrl;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  navigateToPlane(plantUrl: string, typeConfig: string) {
    this.router.navigateByUrl("/admin-pages/plant-plane", { skipLocationChange: true, queryParams: { plantUrl: plantUrl, tenantId: "", type: typeConfig } });
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data._links.self.href);
        break;
      case 'zones':
        this.navigateToPlane(event.data._links.self.href, this.zonevirtual);
        break;
      case 'sensor':
        this.navigateToPlane(event.data._links.self.href, this.sensor);
        break;
    }
  }
}
