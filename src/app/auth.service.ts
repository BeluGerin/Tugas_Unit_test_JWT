// src/app/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export const API = 'https://localhost:7001/api/auth';

export interface Profile {
  id: string; name: string; email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  token: string | null = null;

  login(email: string, password: string) {
    return this.http.post<{token: string}>(
      `${API}/login`, { email, password }
    ).pipe(tap(r => this.token = r.token));
  }

  profile() {
    return this.http.get<Profile>(`${API}/profile`);
  }

  logout() { this.token = null; }
}
