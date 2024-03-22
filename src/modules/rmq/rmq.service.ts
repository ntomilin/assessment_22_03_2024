import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';

export const RMQ_MESSAGES = {
  NEW_CUSTOMER_QUEUE: 'newCustomersQueue',
} as const;

@Injectable()
export class RmqService {
    private channelWrapper: ChannelWrapper;

    constructor() {
        const connection = amqp.connect(['amqp://localhost']);
        this.channelWrapper = connection.createChannel({
            setup: (channel: Channel) => {
                return channel.assertQueue(RMQ_MESSAGES.NEW_CUSTOMER_QUEUE, { durable: true });
            },
        });
    }

    async newCustomerMessage(message: any) {
        try {
            await this.channelWrapper.sendToQueue(
                RMQ_MESSAGES.NEW_CUSTOMER_QUEUE,
                Buffer.from(JSON.stringify(message)),
            );
        } catch (error) {
            throw new HttpException(
                `ERROR ${RMQ_MESSAGES.NEW_CUSTOMER_QUEUE} WITH MESSAGE ${message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
