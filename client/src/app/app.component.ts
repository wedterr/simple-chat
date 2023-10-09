import { Component } from '@angular/core';
import { ChatService } from 'src/core/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Simple Chat';

  constructor(private chatService: ChatService) {
   
  }

  getMsgs() {
    this.chatService.getMessages(1,2);
  }
}
