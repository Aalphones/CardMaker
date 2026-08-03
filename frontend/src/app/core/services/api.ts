import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  postForm<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, formData);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
