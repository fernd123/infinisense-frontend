import { Component, EventEmitter, Input, IterableDiffers, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageMapCreatorService } from 'src/app/core/services/imageMapCreator.service';
import { imageMapCreator } from './p5.image-map-creator';

@Component({
  selector: 'infini-virtualization',
  templateUrl: './virtualization.component.html'
})
export class VirtualizationComponent implements OnInit {


  @Input() height: number;
  @Input() width: number;

  @Output() propagar = new EventEmitter<string>();
  @Input() notificarcambio: Function;

  areas: any;
  differ: any;
  imcreator: imageMapCreator;
  lastAction: string;

  constructor(differs: IterableDiffers,
    private imageMapCreatorService: ImageMapCreatorService,
    public modalService: NgbModal) {
    this.differ = differs.find([]).create(null);
  }

  ngOnInit() {
    this.imcreator = new imageMapCreator("div-1", this.width, this.height);
    this.imageMapCreatorService.setImageMapCreator(this.imcreator);
    this.areas = this.imcreator.map.getAreas();
  }

  ngDoCheck() {
    if (this.imcreator != undefined && this.imcreator.lastAction != null) {
      this.imcreator.editionMode = true;
      console.log(this.imcreator.lastAction);
      let selectedAreaId = "";
      if (this.imcreator.lastAction == 'add') { // first position
        this.areas = this.imcreator.map.getAreas()[0];
        this.areas.id = Math.random();
      } else if (this.imcreator.lastAction == 'delete') {
        //TODO:
      } else if (this.imcreator.lastAction == 'selection' || this.imcreator.lastAction == 'openmodal') {
        selectedAreaId = this.imageMapCreatorService.getImageMapCreator().selectedAreaId;
      }
      this.propagar.emit(JSON.stringify({ "areas": this.areas, "selectedAreaId": selectedAreaId, "action": this.imcreator.lastAction }));

      this.imcreator.lastAction = null;
    }

    if (this.imcreator != undefined && this.imcreator.imageDropped) {
      this.imcreator.editionMode = false;
      this.imcreator.imageDropped = false;
      this.propagar.emit(JSON.stringify({ "action": "uploadImage" }));
    }
  }

  ngOnDestroy() {
    //this.propagar.emit("BIENVENIDO!!");
  }

}
