import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../services/modal.service';
import { LoginService } from '../../../services/login.service';

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
  ) {}

  email = '';
  password = '';

  closeLogin() {
    this.modalService.closeLogin();
  }

  login() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);

        this.modalService.closeLogin();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
