import { Component, OnInit } from '@angular/core';
import { imageMapCreator } from './p5.image-map-creator';

@Component({
  selector: 'infini-virtualization',
  templateUrl: './virtualization.component.html'
})
export class VirtualizationComponent implements OnInit {

  imcreator: imageMapCreator;
  constructor() { }

  ngOnInit() {
    let imcreator = new imageMapCreator("div-1", 700, 555);
  }

}
