import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/core/services/alert.service';
import { ReasonService } from 'src/app/core/services/reason.service';
import { Reason } from 'src/app/shared/models/reason.model';
import { VisitReasonSaveComponent } from './save/visit-reason-save.component';

@Component({
  selector: 'infini-visit-reason',
  templateUrl: './visit-reason.component.html',
  styleUrls: ['./visit-reason.component.scss']
})
export class VisitReasonComponent implements OnInit {

  reasonForm: FormGroup;
  reasonList: Reason[];
  @ViewChild('modalWindow') modalWindow: any;
  editionMode: boolean = false;
  reasonEditUuid: string;
  titleModal: string;

  constructor(private formBuilder: FormBuilder,
    private reasonService: ReasonService,
    private alertService: AlertService,
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
    this.reasonService.getReasons("").subscribe((res: Reason[]) => {
      this.reasonList = res;
    });
  }

  public openSaveModal(uuid: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(VisitReasonSaveComponent);
    modalRef.componentInstance.visitReasonId = uuid;

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
