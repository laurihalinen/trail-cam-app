import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { ImageStore } from '../../stores/image.store';
import { ModalService } from '../../services/modal.service';
import { LoginService } from '../../services/login.service';
import { StatisticsService } from '../../services/stat.service';
import { KeyValuePipe } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
  imports: [KeyValuePipe],
})
export class GalleryComponent {
  private imageService = inject(ImageService);
  public statisticsService = inject(StatisticsService);
  constructor(
    public modalService: ModalService,
    public loginService: LoginService,
  ) {}
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

  openLogin() {
    this.modalService.openLogin();
  }
  logout() {
    this.loginService.logout();
  }

  get hasStatistics(): boolean {
    return Object.keys(this.statisticsService.animalStatistics()).length > 0;
  }
}
