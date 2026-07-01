import { Routes } from '@angular/router';
import { GalleryComponent } from './features/gallery/gallery';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'gallery',
    pathMatch: 'full',
  },
  {
    path: 'gallery',
    component: GalleryComponent,
  },
];
