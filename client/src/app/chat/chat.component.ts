import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from 'src/core/chat.service';
import { ChatMessage } from '../../../../server/chat/chat-message.interface';
import { IInfiniteScrollEvent } from 'ngx-infinite-scroll';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  msgLimit = 10;
  throttle = 500;
  scrollUpDistance = 1;
  msgText = '';

  msgs$: Observable<ChatMessage[]> = this.chatService.messages$;
  userName = this.chatService.getUserName;
  isLoggedIn = this.chatService.isLoggedIn;

  constructor(public router: Router, private chatService: ChatService) {
    this.chatService.getMessages(0, this.msgLimit).subscribe();
  }

  onUp(scroll: IInfiniteScrollEvent) {
    this.chatService.getMessages(10, this.msgLimit).subscribe();
  }

  onEnter() {
    this.chatService.emitMsg(this.msgText);
    this.chatService.updateMessages([{ text: this.msgText, userName: this.userName }]);
    this.msgText = '';
  }

  
  leaveChat() {
    this.router.navigate(['login']);
  }

  stringToHslColor(str: string) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    var h = hash % 360;
    return 'color: hsl('+h+', 100%, 60%)';
  }
}
