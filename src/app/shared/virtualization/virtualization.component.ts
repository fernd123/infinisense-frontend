import { Component, EventEmitter, Input, IterableDiffers, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { SensorTypeService } from 'src/app/core/services/sensorType.service';
import { SensorType } from '../models/sensorType.model';
import { imageMapCreator } from './p5.image-map-creator';

@Component({
  selector: 'infini-virtualization',
  templateUrl: './virtualization.component.html',
  styleUrls: ['./virtualization.component.scss']
})
export class VirtualizationComponent implements OnInit {

  @Input() height: number;
  @Input() width: number;
  @Input() typeConfig: any;
  @Output() propagar = new EventEmitter<string>();
  @Input() notificarcambio: Function;

  areas: any;
  differ: any;
  imcreator: imageMapCreator;
  lastAction: string;
  itemURL: string = "";
  sensorTypeList: SensorType[] = []

  constructor(
    public sensorTypeService: SensorTypeService,
    private imageMapCreatorService: ImageMapCreatorService,
    public modalService: NgbModal) {

  }

  ngOnInit() {
    this.imcreator = new imageMapCreator("div-1", this.width, this.height, this.typeConfig);
    this.imageMapCreatorService.setImageMapCreator(this.imcreator);
    this.areas = this.imcreator.map.getAreas();
    this.sensorTypeService.getSensorTypeList().subscribe((res: any) => {
      if (res != undefined) {
        this.sensorTypeList = res._embedded.sensorTypes;
        this.sensorTypeList.forEach(sensort => {
          this.sensorTypeService.getSensorTypeImage(sensort.image).subscribe(resimg => {
            sensort.imgbuffer = resimg;
          })
        })
      }
    });
  }

  ngDoCheck() {
    if (!this.imcreator.editionMode) {
      if (this.imcreator != undefined && this.imcreator.lastAction != null
        && (this.imcreator.lastAction == 'delete' || this.imcreator.lastAction == 'add' || this.imcreator.lastAction == 'openmodal')) {
        let selectedAreaId = "";
        if (this.imcreator.lastAction == 'add') { // first position
          this.areas = this.imcreator.map.getAreas()[0];
          this.areas.img = this.imcreator.itemURL;
          this.areas.id = Math.random();
          this.imcreator.editionMode = true;
        } else if (this.imcreator.lastAction == 'delete') {
          //TODO:
        } else if (this.imcreator.lastAction == 'openmodal') {
          selectedAreaId = this.imageMapCreatorService.getImageMapCreator().selectedAreaId;
          this.imcreator.editionMode = true;
        }
        this.propagar.emit(JSON.stringify({ "areas": this.areas, "selectedAreaId": selectedAreaId, "action": this.imcreator.lastAction, "sensorTypeId": this.imcreator.getSensorTypeId() }));
        this.imcreator.lastAction = null;
      }// Guardar al arrastrar un elemento
      else if (this.imcreator.lastAction == 'select' && this.imcreator.mouseAction == 'released') { // Si arrastro un elemento y suelto el botón, guardar posición nueva
        let selectedAreaId = this.imageMapCreatorService.getImageMapCreator().selectedAreaId;
        if (selectedAreaId != undefined) {
          this.areas = this.imcreator.map.getAreas().filter(a => {
            if (a.idCoordenate == selectedAreaId) {
              return a;
            }
          });
          this.imcreator.editionMode = true;
          this.imcreator.lastAction = null;
          this.imcreator.mouseAction = null;
          this.areas = this.areas[0];
          this.propagar.emit(JSON.stringify({ "areas": this.areas, "selectedAreaId": selectedAreaId, "selection": true }));
        } else {
          this.imcreator.lastAction = null;
          this.imcreator.mouseAction = null;
        }
      }

      // Al soltar una imagen del plano en el canvas
      if (this.imcreator.imageDropped) {
        this.imcreator.editionMode = false;
        this.imcreator.imageDropped = false;
        this.propagar.emit(JSON.stringify({ "action": "uploadImage" }));
      }
    }
  }

  ngOnDestroy() {
    //this.propagar.emit("BIENVENIDO!!");
  }

}
