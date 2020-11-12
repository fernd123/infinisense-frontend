import { Route } from '@angular/compiler/src/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { PlantService } from 'src/app/core/services/plant.service';
import { UserService } from 'src/app/core/services/user.service';
import { VisitService } from 'src/app/core/services/visit.service';
import { Plant } from 'src/app/shared/models/plant.model';
import { User } from 'src/app/shared/models/user.model';
import { Visit } from 'src/app/shared/models/visit.model';

@Component({
  selector: 'infini-plant-management',
  templateUrl: './plant-management.component.html',
  styleUrls: ['./plant-management.component.scss']
})
export class PlantManagementComponent implements OnInit {

  plantList: Plant[];
  plantForm: FormGroup;
  editionMode: boolean = false;
  plantEditUuid: string;
  titleModal: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private plantService: PlantService,
    private alertService: AlertService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.plantForm = this.formBuilder.group({
      name: [null, Validators.required],
      location: [null, Validators.required],
      phone: [null, Validators.required],
      alternativePhone: [""],
      maximumCapacity: [null, Validators.required]
    });
    this.refreshList();
  }

  refreshList() {
    this.plantService.getPlants("").subscribe( (res: Plant[]) =>{
      this.plantList = res;
    });
  }

  hasFormError(formName : string){
    let element = this.plantForm.get(formName);
    return element.touched && element.invalid; //&& (element.value == null || element.value == '');
  }
  
  closeModal(){
    this.modalService.dismissAll();
    this.plantForm.reset();
    this.plantEditUuid = null;
  }

  openModal(reasonModalContent, plant?: Plant) {
    this.plantForm.reset();
    this.titleModal = "Nueva Planta";
    if (plant != null) {
      this.editionMode = true;
      this.plantEditUuid = plant.uuid;
      this.plantForm.get('name').setValue(plant.name);
      this.plantForm.get('location').setValue(plant.location);
      this.plantForm.get('phone').setValue(plant.phone);
      this.plantForm.get('alternativePhone').setValue(plant.alternativePhone);
      this.plantForm.get('maximumCapacity').setValue(plant.maximumCapacity);
      this.titleModal = "Editar Planta";
    }
    this.modalService.open(reasonModalContent, { size: 'md' });
  }

  submit(){
    let plant: Plant = new Plant();
    plant.name = this.plantForm.get('name').value;
    plant.location = this.plantForm.get('location').value;
    plant.phone = this.plantForm.get('phone').value;
    plant.alternativePhone = this.plantForm.get('alternativePhone').value;
    plant.maximumCapacity = this.plantForm.get('maximumCapacity').value;
    plant.uuid = this.plantEditUuid;

    this.plantService.savePlant(plant, "").subscribe(res =>{
      this.refreshList();
      let options = {
        autoClose: true,
        keepAfterRouteChange: true
      };
      this.plantEditUuid = null;
      this.editionMode = false;
      this.alertService.success(`¡Éxito!, planta ${this.editionMode ? 'actualizada' : 'creada'} correctamente`, options);
      this.modalService.dismissAll();
    });
  }

  navigateToPlane(uuid: string){
    this.router.navigateByUrl("/admin-pages/plant-plane", { skipLocationChange: true, queryParams: {plantId: uuid, tenantId: ""} });

  }
}
