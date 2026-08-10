import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
export interface LoginResponse {
  message: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, {
      email,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    console.log(this.isLoggedIn());
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
