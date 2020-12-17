import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'src/app/core/services/message.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { MessageType } from 'src/app/shared/enums/messageType.enumeration';
import { ZoneType } from 'src/app/shared/enums/zoneType.enumeration';
import { Message } from 'src/app/shared/models/message.model';
import { PlantCoordinates } from 'src/app/shared/models/plantcoordinates.model';
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

  coordinates = "";
  plant: any = "";
  cardbody: any;
  bodydiv: any;

  constructor(
    private modalService: NgbModal,
    private visitService: VisitService,
    private messageService: MessageService,
    private plantService: PlantService
  ) { }

  // mdi mdi-check-circle-outline
  ngOnInit() {
    this.title = `Bienvenido ${this.name}`;

    this.bodydiv = document.getElementById('bodydiv');
    this.cardbody = document.getElementById('cardbody');

    this.messageService.getMessageByType(MessageType.REGISTERINIT).subscribe((resInitMsg: Message) => {
      let message = resInitMsg.name;
      message = message.replace('$name', this.name);
      this.body = message;
      this.bodydiv.innerHTML = this.body;


      /*if (this.visit?.reason?.plantZone != undefined) {
        this.body = `<div style="color:red"><strong>Por favor diríjase a la zona ${this.visit?.reason?.plantZone?.name}</strong></div>`;
      }*/


      // Controlar si no tiene motivo asociado o imagen
      this.visitService.getVisitReason(this.visit.uuid).subscribe((res: any) => {
        this.visitService.getData(res._links.plantCoordinate.href).subscribe((resCoordinate: PlantCoordinates) => {
          this.coordinates = resCoordinate.coordinates;
          if (resCoordinate.virtualZoneType == ZoneType.ru) {
            this.getRouteData(resCoordinate);
          } else {
            this.getZoneData(resCoordinate);
          }
        });
      });
    });
  }


  getRouteData(resCoordinate) {
    this.visitService.getData(resCoordinate._links.initCoordinate.href).subscribe((resCoordinateInit: any) => {
      let coordJson = JSON.parse(resCoordinateInit.coordinates);
      coordJson.title = 'Ud. Está aquí';
      this.coordinates += "," + JSON.stringify(coordJson);
      this.visitService.getData(resCoordinate._links.endCoordinate.href).subscribe((resCoordinateEnd: any) => {
        this.coordinates += "," + resCoordinateEnd.coordinates;
        this.setEpis(resCoordinateEnd);
        this.visitService.getData(resCoordinate._links.plant.href).subscribe((resPlant: any) => {
          this.plant = resPlant;
          this.visitService.getData(resPlant._links.plantPlane.href).subscribe((resPlane: any) => {
            this.plantService.getPlantPlanes(resPlane._embedded.plantPlanes[0].name).subscribe((plantImage: any) => {
              this.setImage(plantImage);
              //let self = this;
              //setTimeout(function () { self.imageZoom("myimage", "myresult"); }, 2000);
            });
          });
        });
      });
    });
  }

  getZoneData(resCoordinate) {
    this.visitService.getData(resCoordinate._links.plant.href).subscribe((resPlant: any) => {
      this.plant = resPlant;
      this.setEpis(resCoordinate);

      this.visitService.getData(resPlant._links.plantPlane.href).subscribe((resPlane: any) => {
        this.plantService.getPlantPlanes(resPlane._embedded.plantPlanes[0].name).subscribe((plantImage: any) => {
          this.setImage(plantImage);
          //let self = this;
          //setTimeout(function () { self.imageZoom("myimage", "myresult"); }, 2000);
        });
      });
    });
  }

  setImage(plantImage) {
    this.image = plantImage;
    this.height = 800;//cardbody.offsetHeight;
    this.width = this.cardbody.offsetWidth - 200;
    this.imcreator = new imageMapCreator("div-1", this.width, this.height, ZoneType.zv);
    this.imcreator.setImage(this.image);
    this.imcreator.clearTool();
    this.imcreator.hideTools();
    this.imcreator.showText = true;
    let mapFake = `{"version":"1","map":{"width":1373,"height":576,"areas":[${this.coordinates}],"name":"${this.plant.name}","hasDefaultArea":false,"dArea":{"shape":"default","coords":[],"href":"","title":"","id":0,"iMap":"nubenet.PNG","isDefault":true},"lastId":1}}`;
    this.imcreator.importMap(mapFake);
  }

  setEpis(coordinate) {
    let epis = coordinate.epis;
    if (epis != undefined && epis.length > 0) {
      let episList = epis.split(',');
      let bodyPre = "<br>Recuerde utilizar:";
      for (let i = 0; i < episList.length; i++) {
        bodyPre += '<div class="col-sm-6"><i class="mdi mdi mdi-check-circle-outline"></i>' + episList[i] + "</div>";
      }
      this.body = this.body + bodyPre;
    }
    if (this.body != undefined)
      this.bodydiv.innerHTML = this.body;
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

