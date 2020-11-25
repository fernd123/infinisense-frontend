import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EpiService } from 'src/app/core/services/epi.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { Epi } from 'src/app/shared/models/epi.model';
import { Reason } from 'src/app/shared/models/reason.model';
import { EpiSaveComponent } from './save/epis-save.component';

@Component({
  selector: 'infini-epis',
  templateUrl: './epis.component.html',
  styleUrls: ['./epis.component.scss']
})
export class EpiComponent implements OnInit {

  reasonForm: FormGroup;
  epiList: Epi[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  titleModal: string;

  constructor(
    private formBuilder: FormBuilder,
    private epiService: EpiService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
    this.reasonForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      active: [true],
      association: [null]
    });
  }

  refreshList() {
    this.epiService.getEpis("").subscribe((res: Epi[]) => {
      this.epiList = res;
    });
  }

  public openSaveModal(uuid: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(EpiSaveComponent);
    modalRef.componentInstance.epiId = uuid;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.reasonForm.reset();
  }
}
