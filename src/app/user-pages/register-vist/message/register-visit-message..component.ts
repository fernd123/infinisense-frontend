import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { PlantCoordsService } from 'src/app/core/services/plantCoordinates.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Reason } from 'src/app/shared/models/reason.model';
import { SensorType } from 'src/app/shared/models/sensorType.model';
import { Visit } from 'src/app/shared/models/visit.model';
import { imageMapCreator } from 'src/app/shared/virtualization/p5.image-map-creator';


@Component({
  selector: 'infini-register-visit-msg',
  templateUrl: './register-visit-message.component.html',
  styleUrls: ['./register-visit-message.component.scss']
})
export class RegisterVisitMessageComponent implements OnInit {

  plantCoordsForm: FormGroup;
  modalTitle: string = "Mensaje del sistema";
  @Input() name: string;
  @Input() visit: any;
  image: any;
  height: number;
  width: number;

  title: string;
  body: string;
  imcreator: any;

  constructor(
    private modalService: NgbModal,
    private visitService: VisitService,
    private plantService: PlantService
  ) { }

  // mdi mdi-check-circle-outline
  ngOnInit() {
    this.title = `Bienvenido ${this.name}`;
    if (this.visit?.reason?.plantZone != undefined) {
      this.body = `<div style="color:red"><strong>Por favor diríjase a la zona ${this.visit?.reason?.plantZone?.name}</strong></div>`;
    }

    let bodydiv = document.getElementById('bodydiv');
    let cardbody = document.getElementById('cardbody');

    let coordinates = "";
    let plant:any = "";
    // COntrolar si no tiene motivo asociado o imagen
    this.visitService.getVisitReason(this.visit.uuid).subscribe((res: any) => {
      this.visitService.getData(res._links.plantCoordinate.href).subscribe((resCoordinate: any) => {
        coordinates = resCoordinate.coordinates;
        this.visitService.getData(resCoordinate._links.plant.href).subscribe((resPlant: any) => {
          plant = resPlant;
          this.visitService.getData(resPlant._links.plantPlane.href).subscribe((resPlane: any) => {
            this.plantService.getPlantPlanes(resPlane._embedded.plantPlanes[0].name).subscribe((plantImage: any) => {
              this.image = plantImage;
              this.height = 800;//cardbody.offsetHeight;
              this.width = cardbody.offsetWidth - 200;
              this.imcreator = new imageMapCreator("div-1", this.width, this.height, ZoneType.zv);
              this.imcreator.setImage(this.image);
              this.imcreator.hideTools();
              let mapFake = `{"version":"1","map":{"width":1373,"height":576,"areas":[${coordinates}],"name":"${plant.name}","hasDefaultArea":false,"dArea":{"shape":"default","coords":[],"href":"","title":"","id":0,"iMap":"nubenet.PNG","isDefault":true},"lastId":1}}`;
              this.imcreator.importMap(mapFake);
              let self = this;
              setTimeout(function () { self.imageZoom("myimage", "myresult"); }, 2000);
            });
          });
        });
      });
    });

    let epis = this.visit?.reason?.plantZone?.epis;
    if (epis != undefined && epis.length > 0) {
      let episList = epis.split(',');
      let bodyPre = "Recuerde utilizar:";
      for (let i = 0; i < episList.length; i++) {
        bodyPre += '<div class="col-sm-6"><i class="mdi mdi mdi-check-circle-outline"></i>' + episList[i] + "</div>";
      }
      this.body = bodyPre + this.body;
    }
    if (this.body != undefined)
      bodydiv.innerHTML = this.body;
    /*this.reasonService.getZoneReasonByUuid(this.reasonId, "").subscribe((res: PlantVirtualization) => {
      if (res != undefined) {
        
      }
    });*/
  }

  closeModal() {
    this.modalService.dismissAll("exit");
  }


  imageZoom(imgID, resultID) {
    var img, lens, result, cx, cy;
    img = document.getElementById(imgID);
    result = document.getElementById(resultID);
    /*create lens:*/
    lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");
    /*insert lens:*/
    img.parentElement.insertBefore(lens, img);
    /*calculate the ratio between result DIV and lens:*/
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /*set background properties for the result DIV:*/
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    function moveLens(e) {
      var pos, x, y;
      /*prevent any other actions that may occur when moving over the image:*/
      e.preventDefault();
      /*get the cursor's x and y positions:*/
      pos = getCursorPos(e);
      /*calculate the position of the lens:*/
      x = pos.x - (lens.offsetWidth / 2);
      y = pos.y - (lens.offsetHeight / 2);
      /*prevent the lens from being positioned outside the image:*/
      if (x > img.width - lens.offsetWidth) { x = img.width - lens.offsetWidth; }
      if (x < 0) { x = 0; }
      if (y > img.height - lens.offsetHeight) { y = img.height - lens.offsetHeight; }
      if (y < 0) { y = 0; }
      /*set the position of the lens:*/
      lens.style.left = x + "px";
      lens.style.top = y + "px";
      /*display what the lens "sees":*/
      result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
    function getCursorPos(e) {
      var a, x = 0, y = 0;
      e = e || window.event;
      /*get the x and y positions of the image:*/
      a = img.getBoundingClientRect();
      /*calculate the cursor's x and y coordinates, relative to the image:*/
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /*consider any page scrolling:*/
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      return { x: x, y: y };
    }
  }
}

