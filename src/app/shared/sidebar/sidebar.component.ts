import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public uiBasicCollapsed = false;
  public samplePagesCollapsed = false;
  public masterDataCollapsed = false;
  public plantDataCollapsed = false;
  public userManagementCollapsed = false;
  public visitDataCollapsed = false;
  public companyDataCollapsed = false;
  public companyCustomerDataCollapsed = false;

  public aliro: boolean = false;
  public ergo: boolean = false;

  public name: string = "";
  @ViewChild('profileImage') profileImage: any;

  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    const body = document.querySelector('body');

    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll('.sidebar .nav-item').forEach(function (el) {
      el.addEventListener('mouseover', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function () {
        if (body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });

    // User data
    let data: any = this.authService.getTokenInfo();
    if (data == null) return;
    this.aliro = data.aliro;
    this.ergo = data.ergo;

    /* PERMISSION MODULE */
    let authorities = data.authorities;
    if (authorities != null) {
      let perm = [];
      for (let i = 0; i < authorities.length; i++) {
        perm.push(authorities[i].authority);
      }
      this.permissionsService.loadPermissions(perm);

      /* if (alira)
           perm.push("ALIRA");
   
       if (ergo)
           perm.push("ERGO");
       */

      if (data != undefined)
        this.userService.getUserByUuid(data.uuid).subscribe((res: User) => {
          if (res != undefined) {
            let firstName = res.firstname;
            let lastName = res.lastname;
            let initials = firstName.charAt(0) + lastName.charAt(0);
            this.name = firstName + " " + lastName;
            if (this.name.length > 15) {
              this.name = this.name.substr(0, 15) + ".";
            }
            let profileImageElem = document.getElementById('profileImage');
            if (profileImageElem != undefined) {
              profileImageElem.innerHTML = initials.toUpperCase();
            }
          }
        });
    } else {
      this.router.navigate(['admin']);
    }
  }

}
