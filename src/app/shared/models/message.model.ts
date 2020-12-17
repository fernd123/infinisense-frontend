import { MessageType } from '../enums/messageType.enumeration';
import { IMessage } from '../interfaces/iMessage.interface';
import { BaseModel } from './base.model';

export class Message extends BaseModel implements IMessage {
    uuid: string;
    name: string;
    type: MessageType;
}