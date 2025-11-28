import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  user: any = null;
  menuAbierto = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    this.user = userJson ? JSON.parse(userJson) : null;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.user = null;
    this.menuAbierto = false;
    this.router.navigate(['/inicio']);
  }
}
