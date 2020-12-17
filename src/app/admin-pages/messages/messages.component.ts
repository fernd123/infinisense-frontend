import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MessagesSaveComponent } from './save/messages-save.component';
import { MessageService } from 'src/app/core/services/message.service';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'infini-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  @ViewChild('modalWindow') modalWindow: any;
  data: Message[];
  editionMode: boolean = false;
  titleModal: string;

  /* Table Settings */
  settings = {
    columns: {
      name: {
        title: this.translateService.instant('name')
      },
      type: {
        title: this.translateService.instant('type'),
        filter: false,
        valuePrepareFunction: (data) => {
          switch (data) {
            case "REGISTERINIT":
              return "Visita bienvenida";
            case "REGISTEREND":
              return "Visita salida";
            case "RETURNEPIS":
              return "Devolución epis";
            case "PROJECTINVITATION":
              return "Participación proyecto";
          }
        }
      }
    },
    actions: {
      columnTitle: this.translateService.instant('actions'),
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>' }
      ],
      position: 'right'
    },
    edit: {
      editButtonContent: '<i class="mdi mdi-grease-pencil btn-icon-append"></i>'
    },
    attr: {
      class: 'table table-bordered'
    },
    rowClassFunction: (row) => {
      // row css
    },
    pager: {
      display: true,
      perPage: 10
    }
  };

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.messageService.getMessages().subscribe((res: any) => {
      this.data = res._embedded.messages;
    });
  }

  public openSaveModal(messageUrl: string, size?: string): void {
    if (!size || size === undefined) { size = 'modal-lg'; }
    const modalRef = this.modalService.open(MessagesSaveComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.messageUrl = messageUrl;

    modalRef.result.then(() => { console.log('When user closes'); },
      (res) => {
        this.refreshList();
      });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onCustomAction(event) {
    switch (event.action) {
      case 'edit':
        this.openSaveModal(event.data._links.self.href);
        break;
      case 'remove':
        this.messageService.deleteMessage(event.data._links.self.href).subscribe(res => {
          this.refreshList();
        });
        break;
    }
  }
}
