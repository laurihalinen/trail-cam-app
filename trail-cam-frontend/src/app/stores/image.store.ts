import { Injectable, computed, signal } from '@angular/core';
import { ImageItem } from '../services/image.service';

@Injectable({
  providedIn: 'root',
})
export class ImageStore {
  images = signal<ImageItem[]>([]);

  animals = computed(() => this.images().filter((image) => image.hasAnimal));

  setImages(images: ImageItem[]) {
    console.log(images);
    this.images.set(images);
  }
}
