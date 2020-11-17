import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertModule } from './alert/alert.module';
import { VirtualizationComponent } from './virtualization/virtualization.component';

@NgModule({
  declarations: [
    VirtualizationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports: [
    CommonModule,
    VirtualizationComponent,
    ReactiveFormsModule
  ],
  entryComponents: [
  ],
  providers: []
})
export class SharedModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}