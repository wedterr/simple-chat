import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/core/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  userName = this.chatService.getUserName;

  constructor(public router: Router, private chatService: ChatService) {}

  ngOnInit() {
    if (this.chatService.isLoggedIn) {
      this.chatService.logout();
    }
  }

  onEnter() {
    if (this.userName.length > 0) {
      if (!this.chatService.isLoggedIn) {
        this.chatService.login(this.userName);
        sessionStorage.setItem('userName', this.userName);
        this.router.navigate(['chat']);
      }
    }
  }
}
