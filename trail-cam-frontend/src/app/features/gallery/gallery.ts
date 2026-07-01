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
}
