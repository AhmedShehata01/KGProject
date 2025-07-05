import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterModule, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  sidebarOpen = true;
  isMobile = false;

  constructor() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private checkScreen() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarOpen = false;
    } else {
      this.sidebarOpen = true;
    }
  }
}
