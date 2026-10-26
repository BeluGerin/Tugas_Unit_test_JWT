// src/app/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true, imports: [FormsModule],
  template: `
    <form (ngSubmit)="submit()">
      <input name="email" [(ngModel)]="email"
        type="email" required placeholder="Email">
      <input name="password" [(ngModel)]="password"
        type="password" required placeholder="Password">
      <button type="submit">Login</button>
    </form><p>{{ error() }}</p>`
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  email = 'user@example.com';
  password = ''; error = signal('');

  submit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => this.error.set('Login gagal')
    });
  }
}
