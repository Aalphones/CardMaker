import { HttpInterceptorFn } from '@angular/common/http';

import { readStoredAuth } from './auth-storage';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = readStoredAuth();
  if (!auth) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } }));
};
