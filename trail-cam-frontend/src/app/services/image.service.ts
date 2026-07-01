import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<ImageItem[]>(this.apiUrl);
  }
}
