import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { PlantSensorSaveComponent } from './save/plant-sensor-save.component';

@Component({
  selector: 'infini-plant-sensor',
  templateUrl: './plant-sensor.component.html',
  styleUrls: ['./plant-sensor.component.scss']
})
export class PlantSensorComponent implements OnInit {

  reasonForm: FormGroup;
  plantList: Plant[] = [];
  plantCoordsList: PlantCoordinates[] = [];
  selectedPlantUuid: string;

  @ViewChild('modalWindow') modalWindow: any;
  @ViewChild('optionFilter') optionFilter: any;
  optionValue: string;

  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

  constructor(
    private plantService: PlantService,
    private plantCoordsService: PlantCoordsService,
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
      let filter = this.optionFilter != null ? this.plantList[this.optionFilter.nativeElement.selectedIndex].uuid : this.plantList[0].uuid;
      this.plantCoordsService.getPlantCoordinates(filter, "").subscribe((res: PlantCoordinates[]) => {
        this.plantCoordsList = res;
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
}
