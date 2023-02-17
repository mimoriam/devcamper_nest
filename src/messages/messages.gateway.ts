import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

// https://www.youtube.com/watch?v=atbdpX4CViM
@WebSocketGateway()
export class MessagesGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  onModuleInit(): any {
    this.server.on('connection', (socket) => {
      // console.log(socket.id);
    });
  }

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.create(
      createMessageDto,
      client.id,
    );

    console.log(message);

    // Emit an event to ALL connected clients:
    this.server.emit('message', message);
    return message;
  }

  @SubscribeMessage('findAllMessages')
  async findAll() {
    this.server.emit('findAllMessagess', await this.messagesService.findAll());
    return await this.messagesService.findAll();
  }

  @SubscribeMessage('join')
  async joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    return this.messagesService.join(name, client.id);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = await this.messagesService.getClientName(client.id);

    // Emit an event to all clients except the currently connected one:
    client.broadcast.emit('typing', { name, isTyping });
  }
}
