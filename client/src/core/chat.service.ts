import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ChatClientEvents, ChatServerEvents } from '../../../server/events';
import { ChatMessage } from '../../../server/chat/chat-message.interface';
import { BehaviorSubject, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private totalCountBS: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  totalMessageCount$ = this.totalCountBS.asObservable();

  private availableCountBS: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  vailableMessageCount$ = this.availableCountBS.asObservable();

  private messagesBS: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<
    ChatMessage[]
  >([]);
  messages$ = this.messagesBS.asObservable();

  private loggedIn: boolean = false;
  public get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  private userName: string = '';
  public get getUserName(): string {
    return this.userName;
  }

  private numUsers: number = 0;
  public get getUsersCount(): number {
    return this.numUsers;
  }

  private socket: Socket;
  private readonly host = 'http://localhost:3000';

  constructor(private httpClient: HttpClient) {
    this.socket = io(this.host);

    this.userName = sessionStorage.getItem('userName') ? sessionStorage.getItem('userName') as string : '';
    if (this.userName.length > 0) {
      if (!this.isLoggedIn) {
        this.login(this.userName);
      }
    }

    this.socket.on(ChatServerEvents.Login, (numUsers: number) => {
      this.loggedIn = true;
      this.numUsers = numUsers;
    });

    this.socket.on(
      ChatClientEvents.NewMesage,
      (msg: ChatMessage) => {
        this.updateMessages([msg]);
      }
    );
  }

  login(name: string) {
    if (this.socket.disconnected) {
      this.socket.connect();
    }

    this.socket.emit(ChatClientEvents.AddUser, name);
    this.userName = name;
    this.loggedIn = true;
  }

  logout() {
    this.socket.disconnect();
    this.loggedIn = false;
  }

  emitMsg(msg: string) {
    if (this.loggedIn) {
      this.socket.emit(ChatClientEvents.NewMesage, msg);
    }
  }

  getMessages(skip: number = 0, limit: number = 10) {
    return this.httpClient
      .get<{ metadata: { totalCount: number }; data: ChatMessage[] }[]>(
        `${this.host}/api/messages`,
        {
          params: {
            skip: this.availableCountBS.getValue(),
            limit,
          },
        }
      )
      .pipe(
        tap((res) => {
          this.totalCountBS.next(res[0]?.metadata.totalCount);
          this.messagesBS.next([
            ...this.messagesBS.getValue(),
            ...res[0]?.data,
          ]);
          this.availableCountBS.next(this.messagesBS.getValue().length);
        }),
        map((res) => res[0]?.data as ChatMessage[])
      );
  }

  updateMessages(messages: ChatMessage[]) {
    this.totalCountBS.next(this.totalCountBS.getValue() + 1);
    this.messagesBS.next([...messages, ...this.messagesBS.getValue(), ]);
    this.availableCountBS.next(this.messagesBS.getValue().length);
  }
}
