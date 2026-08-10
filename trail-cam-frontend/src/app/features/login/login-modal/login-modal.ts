import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../services/modal.service';
import { LoginService } from '../../../services/login.service';
import { ImageService } from '../../../services/image.service';
import { ImageStore } from '../../../stores/image.store';

@Component({
  selector: 'app-login-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
})
export class LoginModal {
  constructor(
    public modalService: ModalService,
    public loginService: LoginService,
    public imageService: ImageService,
  ) {}
  private imageStore = inject(ImageStore);
  email = '';
  password = '';

  closeLogin() {
    this.modalService.closeLogin();
  }

  login() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);

        this.imageService.getImages().subscribe({
          next: (images) => {
            this.imageStore.setImages(images);
          },
          error: (err) => {
            console.error(err);
          },
        });

        this.modalService.closeLogin();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
