import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginModal } from './features/login/login-modal/login-modal';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('trail-cam-frontend');
  constructor(public modalService: ModalService) {}
}
