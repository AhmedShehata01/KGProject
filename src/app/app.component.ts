import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'KGProject';
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit() {
    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
