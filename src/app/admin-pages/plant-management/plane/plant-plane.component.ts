import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Route } from '@angular/compiler/src/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantPlane } from 'src/app/shared/models/plantPlane.model';
import { PlantCoordsSaveComponent } from './save/plant-coords-save.component';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';

@Component({
  selector: 'infini-plant-plane',
  templateUrl: './plant-plane.component.html',
  styleUrls: ['./plant-plane.component.scss']
})
export class PlanPlaneComponent implements OnInit {

  plantId: string;
  plantPlaneId: string;
  tenantId: string;
  plant: Plant;
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  iMap: any;

  fileInfos: Observable<any>;

  plantImgList: any;
  @ViewChild('virtualizationBody') virtualizationBody: any;
  height: number = 700;
  width: number = 500;
  virtualizationList: PlantCoordinates[];
  img: any;


  constructor(
    private formBuilder: FormBuilder,
    private imageMapCreatorService: ImageMapCreatorService,
    private plantService: PlantService,
    private plantCoordService: PlantCoordsService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: Router) {
    this.plantId = this.route.getCurrentNavigation().extras.queryParams.plantId;
    this.tenantId = this.route.getCurrentNavigation().extras.queryParams.tenantId;

    this.plantService.getPlantByUuid(this.plantId, this.tenantId).subscribe((res: Plant) => {
      if (res != undefined) {
        this.plantService.getPlantPlaneByPlant(this.plantId, this.tenantId).subscribe((resPp: PlantPlane) => {
          if (resPp != undefined) {
            this.plantPlaneId = resPp.uuid;
            this.plantService.getPlantPlanes(resPp.name, 'tenantId').subscribe(res => {
              this.img = res;
              this.imageMapCreatorService.getImageMapCreator().setImage(this.img);
            });
            //let plantPlaneList: PlantPlane[] = resPp;
            /*for (let i = 0; i < plantPlaneList.length; i++) { //TODO: Solo uno para la demo
              plantRequest.push(this.plantService.getPlantPlanes(plantPlaneList[i].name, 'tenantId'));
              this.plantPlaneId = plantPlaneList[i].uuid;
            }*/
            /*if (plantRequest.length > 0) {
              forkJoin(plantRequest).subscribe((res: any) => {
                
              });
            }*/
          }
        });

        this.refreshVirtualZones();
      }
      //this.plantService.getPlantPlanes(plantId, tenantId).subscribe(res=>{
    });
  }

  ngOnInit() {
    this.width = document.getElementById('virtualizationBody').offsetWidth - 200;
  }


  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  upload() {
    this.progress = 0;
    this.currentFile = this.imageMapCreatorService.getImageMapCreator().getImage().file;
    this.plantService.upload(this.currentFile, this.plantId, this.plantPlaneId).subscribe(
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
    //console.log(data);
    debugger;
    let dataJson = JSON.parse(data);
    let action = dataJson.action;
    if (action == "uploadImage") {
      this.upload();
    }
    else if (action != "select") {
      this.openSaveModal(dataJson);
    } else {
      let plantCoords = new PlantCoordinates();
      // buscar por id en la lista y guardar los cambios
      /*this.imageMapCreatorService.getImageMapCreator().map.getAreas().forEach(area => {
        if (area.id == selectedIndex) {
          plantCoords.plantid = this.plantId;
          plantCoords.coordinates = area.getCoords();
        }
      });
      this.plantCoordService.savePlantVirtual(plantCoords, "").subscribe(res => {

      });*/
    }
  }

  public searchCoordinates(uuid: string) {
    console.log("entroooo");
    let imagemap = this.imageMapCreatorService.getImageMapCreator();
    imagemap.searchArea(uuid);
  }

  public openEditModal(uuid: string) {
    const modalRef = this.modalService.open(PlantCoordsSaveComponent);
    modalRef.componentInstance.selectedAreaId = uuid;
    modalRef.componentInstance.plantId = this.plantId;
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



  public openSaveModal(areasData: any, size?: string): void {
    // Service callback function to create the modal with an object passed as a parameter
    //const initialState = this.getSaveModalParameters(selectedObject);
    if (!size || size === undefined) { size = 'modal-lg'; }
    debugger;
    const modalRef = this.modalService.open(PlantCoordsSaveComponent);
    modalRef.componentInstance.coordinates = JSON.stringify(areasData.areas);
    modalRef.componentInstance.selectedAreaId = areasData.selectedAreaId;
    modalRef.componentInstance.plantId = this.plantId;
    this.imageMapCreatorService.getImageMapCreator().editionMode = true;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshVirtualZones();
        this.imageMapCreatorService.getImageMapCreator().editionMode = false;
        this.imageMapCreatorService.getImageMapCreator().selectedAreaId = null;
        this.imageMapCreatorService.getImageMapCreator().clearSelection();
        if (res != "success") {
          //const mapCreator: imageMapCreator = this.imageMapCreatorService.getImageMapCreator();
          //mapCreator.deleteArea(mapCreator.map.getAreas()[0]); // first position
        } else {
        }
      });
  }

  private refreshVirtualZones() {
    this.plantCoordService.getPlantPlaneByPlant(this.plantId, this.tenantId).subscribe((resPp: PlantCoordinates[]) => {
      this.virtualizationList = resPp;
      let imageCreator = this.imageMapCreatorService.getImageMapCreator();
      imageCreator.clearAreas();
      let areas = [];
      //TODO: añadir las zonas en el atributo "area" del mapfake
      let areasStr = "";
      for (let i = 0; i < resPp.length; i++) {
        this.plant = resPp[i].plant;
        areasStr += resPp[i].coordinates;
        if (i != resPp.length - 1) {
          areasStr += ", ";
        }
      }

      if (areasStr.length != 0) {
        let mapFake = `{"version":"1","map":{"width":1373,"height":576,"areas":[${areasStr}],"name":"${this.plant.name}","hasDefaultArea":false,"dArea":{"shape":"default","coords":[],"href":"","title":"","id":0,"iMap":"nubenet.PNG","isDefault":true},"lastId":1}}`;
        imageCreator.importMap(mapFake);
      }
    });
  }

  public deleteVirtualZone(uuid: string) {
    this.plantCoordService.deleteVirtualZone(this.plantId, uuid).subscribe(res => {
      this.refreshVirtualZones();
    });
  }
}

