import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Route } from '@angular/compiler/src/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { UserService } from 'src/app/core/services/user.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { PlantPlane } from 'src/app/shared/models/plantPlane.model';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { imageMapCreator } from "image-map-creator";

@Component({
  selector: 'infini-plant-plane',
  templateUrl: './plant-plane.component.html',
  styleUrls: ['./plant-plane.component.scss']
})
export class PlanPlaneComponent implements OnInit {

  plantId: string;
  tenantId: string;
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  iMap: any;

  fileInfos: Observable<any>;

  plantImgList: any;


  constructor(
    private formBuilder: FormBuilder,
    private plantService: PlantService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private route: Router) {
    this.plantId = this.route.getCurrentNavigation().extras.queryParams.plantId;
    this.tenantId = this.route.getCurrentNavigation().extras.queryParams.tenantId;
    this.plantService.getPlant(this.plantId, this.tenantId).subscribe((res: Plant) => {
      if (res != undefined) {
        this.plantService.getPlantPlaneByPlant(this.plantId, this.tenantId).subscribe((resPp: PlantPlane[]) => {
          debugger;
          let plantPlaneList: PlantPlane[] = resPp;
          let plantRequest: any[] = [];
          for (let i = 0; i < plantPlaneList.length; i++) {
            plantRequest.push(this.plantService.getPlantPlanes(plantPlaneList[i].name, 'tenantId'));
          }
          if (plantRequest.length > 0) {
            forkJoin(plantRequest).subscribe((res: any) => {
              debugger;
              var headers = res.headers;
              console.log(headers); //<--- Check log for content disposition
              var contentDisposition = headers.get('content-disposition');
              debugger;
            });
          }
        })
      }
      //this.plantService.getPlantPlanes(plantId, tenantId).subscribe(res=>{
    });
  }

  ngOnInit() {
    //this.iMap = new imageMapCreator("div-1");
  }

  ngAfterViewInit() {
    let ff = function storeGuess(event) {
      var x = event.offsetX;
      var y = event.offsetY;
      var guessX = x;
      var guessY = y;
      console.log("x coords: " + guessX + ", y coords: " + guessY);
    }

    let canvas = document.getElementById('div-1').children[0];
    canvas.addEventListener('mousedown', ff);
    canvas.addEventListener('mouseup', ff);

    let div = document.getElementById('div-1');
    div.children[1].children[1].children[1].children[1];
    let title : any = div.children[1].children[0];
    title.innerText = 'Virtualización de zonas'; //title

    debugger;
    let generateSvn : any = div.children[1].children[1].children[6];
    let generateHtml : any = div.children[1].children[1].children[7];
    let save : any = div.children[1].children[1].children[9];
    let output : any = div.children[1].children[1].children[8];

    output.hidden = true;
    generateSvn.hidden = true;
    generateHtml.hidden = true;
    save.hidden = true;
    output.hidden = true;


  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }

  upload() {
    this.progress = 0;

    this.currentFile = this.selectedFiles.item(0);
    this.plantService.upload(this.currentFile, this.plantId).subscribe(
      event => {
        debugger;
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
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
}
