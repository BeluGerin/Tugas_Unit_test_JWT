// src/app/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API, AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {
    const auth = inject(AuthService);
    const isApi = req.url.startsWith(API + '/');
    const token = auth.token;
    if (isApi && token) {
      req = req.clone({ setHeaders: {
        Authorization: 'Bearer ' + token
      }});
    }
    return next(req).pipe(catchError(err => {
      if (isApi && err.status === 401) auth.logout();
      return throwError(() => err);
    }));
  };
