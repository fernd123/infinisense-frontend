import { Injectable } from '@angular/core';
import { imageMapCreator } from 'src/app/shared/virtualization/p5.image-map-creator';

/**
 * Este servicio solo sirve para compartir la variable compartida de map creator, para poder reinicializar
 * y acceder a variables desde varios componentes de forma sencilla
 */

@Injectable({ providedIn: 'root' })
export class ImageMapCreatorService {

    private imageMapCreator: imageMapCreator;

    constructor() { }

    public setImageMapCreator(imageMapCreator: imageMapCreator) {
        this.imageMapCreator = imageMapCreator;
    }

    public getImageMapCreator() {
        return this.imageMapCreator;
    }

    public clearImageMapCreator() {
        this.imageMapCreator = null;
    }
}