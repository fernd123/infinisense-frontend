import { Component, OnInit, ViewChild } from '@angular/core';
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
  public name: string = "";
  @ViewChild('profileImage') profileImage: any;

  constructor(
    private userService: UserService,
    private authService: AuthenticationService
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
    if (data != undefined)
      this.userService.getUserByUuid(data.uuid, "").subscribe((res: User) => {
        if (res != undefined) {
          let firstName = res.firstname;
          let lastName = res.lastname;
          let initials = firstName.charAt(0) + lastName.charAt(0);
          this.name = firstName + " " + lastName;
          if (this.name.length > 15) {
            this.name = this.name.substr(0, 15) + ".";
          }
          document.getElementById('profileImage').innerHTML = initials.toUpperCase();
        }
      });
  }

}
