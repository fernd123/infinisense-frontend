import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { PlantService } from 'src/app/core/services/plant.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantPlane } from 'src/app/shared/models/plantPlane.model';
import { PlantCoordsSaveComponent } from './save/plant-coords-save.component';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
import { TranslateService } from '@ngx-translate/core';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';

@Component({
  selector: 'infini-plant-plane',
  templateUrl: './plant-plane.component.html',
  styleUrls: ['./plant-plane.component.scss']
})
export class PlanPlaneComponent implements OnInit {

  plantUrl: string;
  plantPlaneId: string;
  typeConfig: any;
  plant: Plant;
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  iMap: any;
  plantImgList: any;
  height: number = 700;
  width: number = 500;
  virtualizationList: PlantCoordinates[];
  routeList: PlantCoordinates[];

  img: any;

  @ViewChild('virtualizationBody') virtualizationBody: any;
  fileInfos: Observable<any>;

  constructor(
    private imageMapCreatorService: ImageMapCreatorService,
    private plantService: PlantService,
    private translateService: TranslateService,
    private plantCoordService: PlantCoordsService,
    private modalService: NgbModal,
    private router: Router) {
    this.plantUrl = this.router.getCurrentNavigation().extras.queryParams.plantUrl;
    this.typeConfig = this.router.getCurrentNavigation().extras.queryParams.type;
    this.plantService.getPlantByUuid(this.plantUrl).subscribe((res: Plant) => {
      this.plant = res;
      if (res != undefined) {
        this.plantService.getPlantPlaneByPlant(this.plantUrl).subscribe((resPp: PlantPlane) => {
          if (resPp != undefined) {
            this.plantPlaneId = resPp.uuid;
            this.plantService.getPlantPlanes(resPp.name).subscribe(res => {
              this.img = res;
              this.imageMapCreatorService.getImageMapCreator().setImage(this.img);
            });
          }
        });
        this.refreshVirtualZones();
      }
    });
  }

  ngOnInit() {
    this.width = document.getElementById('virtualizationBody').offsetWidth - 200;
  }

  ngAfterViewInit() {
    this.imageMapCreatorService.getImageMapCreator().setTypeConfig(this.typeConfig);
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  upload() {
    this.progress = 0;
    this.currentFile = this.imageMapCreatorService.getImageMapCreator().getImage().file;
    this.plantService.upload(this.currentFile, this.plantUrl, this.plantPlaneId).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
          this.currentFile = null;
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.fileInfos = this.plantService.getFiles();
        }
      },
      err => {
        this.progress = 0;
        this.message = 'Could not upload the file!';
        this.currentFile = undefined;
      });
    this.selectedFiles = undefined;
  }


  /* VIRTUALIZATION */
  procesaPropagar(data) {
    let dataJson = JSON.parse(data);
    let action = dataJson.action;

    if (action == "uploadImage") {
      this.upload();
    }
    else if (action != "select") {
      this.openSaveModal(dataJson);
    }
  }

  public searchCoordinates(uuid: string) {
    let imagemap = this.imageMapCreatorService.getImageMapCreator();
    imagemap.searchArea(uuid);
  }

  public openSaveModal(dataJson: any, size?: string): void {
    // Service callback function to create the modal with an object passed as a parameter
    //const initialState = this.getSaveModalParameters(selectedObject);
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(PlantCoordsSaveComponent);
    modalRef.componentInstance.coordinates = JSON.stringify(dataJson.areas);
    modalRef.componentInstance.selectedAreaId = dataJson.selectedAreaId;
    modalRef.componentInstance.sensorTypeId = dataJson.sensorTypeId;
    modalRef.componentInstance.selection = dataJson.selection;
    modalRef.componentInstance.plantUrl = this.plantUrl;
    modalRef.componentInstance.typeConfig = this.typeConfig;
    modalRef.componentInstance.initialArea = dataJson?.initialArea?.idCoordenate; // for rutes
    modalRef.componentInstance.finalArea = dataJson?.finalArea?.idCoordenate; // for rutes


    this.imageMapCreatorService.getImageMapCreator().editionMode = true;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshVirtualZones();
        this.imageMapCreatorService.getImageMapCreator().editionMode = false;
        this.imageMapCreatorService.getImageMapCreator().selectedAreaId = null;

        this.imageMapCreatorService.getImageMapCreator().clearSelection();
        document.getElementById('drag-items').click();
        if (res != "success") {
          //const mapCreator: imageMapCreator = this.imageMapCreatorService.getImageMapCreator();
          //mapCreator.deleteArea(mapCreator.map.getAreas()[0]); // first position
        } else {
        }
      });
  }

  public openEditModal(plantCoordinate: any) {
    const modalRef = this.modalService.open(PlantCoordsSaveComponent);
    modalRef.componentInstance.plantCoordinateUrlFromTable = plantCoordinate._links.self.href;
    modalRef.componentInstance.plantUrl = this.plantUrl;
    modalRef.componentInstance.sensorTypeId = plantCoordinate._links.sensorType.href;
    this.imageMapCreatorService.getImageMapCreator().editionMode = true;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshVirtualZones();
        this.imageMapCreatorService.getImageMapCreator().editionMode = false;
        if (res != "success") {
          //const mapCreator: imageMapCreator = this.imageMapCreatorService.getImageMapCreator();
          //mapCreator.deleteArea(mapCreator.map.getAreas()[0]); // first position
        } else {
        }
      });
  }

  private refreshVirtualZones() {
    this.plantCoordService.getPlantPlaneByPlant(this.plantUrl + "/plantCoordinate", this.typeConfig).subscribe((resPp: any) => {
      this.virtualizationList = resPp._embedded.plantCoordinateses.filter(f => { return f.virtualZoneType == this.typeConfig });
      this.routeList = resPp._embedded.plantCoordinateses.filter(f => { return f.virtualZoneType == ZoneType.ru });
      let imageCreator = this.imageMapCreatorService.getImageMapCreator();
      imageCreator.clearAreas();
      let areasStr = "";

      /* Zone virtual and sensors */
      for (let i = 0; i < this.virtualizationList.length; i++) {
        areasStr += this.virtualizationList[i].coordinates + ", ";
      }

      /* Routes. Only avaiable with virtual zone */
      if (this.typeConfig == ZoneType.zv)
        for (let i = 0; i < this.routeList.length; i++) {
          areasStr += this.routeList[i].coordinates + ", ";
        }

      if (areasStr.length != 0) {
        areasStr = areasStr.substr(0, areasStr.length-2);
      }

      let mapFake = `{"version":"1","map":{"width":1373,"height":576,"areas":[${areasStr}],"name":"${this.plant.name}","hasDefaultArea":false,"dArea":{"shape":"default","coords":[],"href":"","title":"","id":0,"iMap":"nubenet.PNG","isDefault":true},"lastId":1}}`;
      imageCreator.importMap(mapFake);
      //}
    });
  }

  public deleteVirtualZone(uuid: string) {
    this.plantCoordService.deleteVirtualZone(this.plantUrl).subscribe(res => {
      this.refreshVirtualZones();
    });
  }

  back() {
    this.router.navigateByUrl("/admin-pages/plant-management");
  }

  getTitleConfig() {
    return this.typeConfig == ZoneType.zv ? this.translateService.instant('plant.configuratedzones') : this.translateService.instant('plant.configuratedsensors');
  }
}

