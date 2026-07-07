import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { ImageStore } from '../../stores/image.store';

@Component({
  standalone: true,
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
})
export class GalleryComponent {
  private imageService = inject(ImageService);

  imageStore = inject(ImageStore);

  selectedImage: any = null;

  ngOnInit() {
    this.imageService.getImages().subscribe((images) => {
      this.imageStore.setImages(images);
    });
  }

  open(image: any) {
    this.selectedImage = image;
  }

  close() {
    this.selectedImage = null;
  }

  setFilter(value: 'all' | 'animals') {
    this.imageStore.setFilter(value);
  }

  setSearch(value: string) {
    this.imageStore.setSearch(value);
  }

  filter() {
    return this.imageStore.filter();
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
