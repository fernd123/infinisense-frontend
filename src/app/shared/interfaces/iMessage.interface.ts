import { MessageType } from '../enums/messageType.enumeration';

export interface IMessage {
    uuid: string;
    name: string;
    type: MessageType;
}