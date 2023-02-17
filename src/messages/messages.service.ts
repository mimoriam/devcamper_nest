import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  messages: Message[] = [
    {
      name: 'Dummy Name',
      text: 'dummy text',
    },
  ];

  clientToUser = {};

  async create(createMessageDto: CreateMessageDto, clientId: string) {
    const message = {
      name: this.clientToUser[clientId],
      text: createMessageDto.text,
    };
    this.messages.push(message);

    return message;
  }

  async findAll() {
    console.log(this.messages);
    return this.messages;
  }

  async join(name: string, clientId: string) {
    this.clientToUser[clientId] = name;

    return Object.values(this.clientToUser);
  }

  async getClientName(clientId: string) {
    return this.clientToUser[clientId];
  }
}
