import { Route } from '@angular/compiler/src/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlantService } from 'src/app/core/services/plant.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantManagementSaveComponent } from './save/plant-management-save.component';

@Component({
  selector: 'infini-plant-management',
  templateUrl: './plant-management.component.html',
  styleUrls: ['./plant-management.component.scss']
})
export class PlantManagementComponent implements OnInit {

  plantList: Plant[];
  titleModal: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private plantService: PlantService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.plantService.getPlants("").subscribe((res: Plant[]) => {
      this.plantList = res;
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

  navigateToPlane(uuid: string) {
    this.router.navigateByUrl("/admin-pages/plant-plane", { skipLocationChange: true, queryParams: { plantId: uuid, tenantId: "" } });

  }
}
