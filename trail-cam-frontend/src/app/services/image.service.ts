import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';
export interface ImageItem {
  key: string;
  url: string;
  hasAnimal: boolean;
  labels: string[];
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  getImages(): Observable<ImageItem[]> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ImageItem[]>(this.apiUrl, { headers });
  }
}
