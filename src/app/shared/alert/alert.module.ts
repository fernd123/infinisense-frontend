import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertComponent } from './alert.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [
      AlertComponent
    ],
    imports: [
      CommonModule
    ],
    exports: [AlertComponent],
    providers: []
  })
  export class AlertModule { }