import { ObjectId } from 'mongodb';

export class UserDto {
    name: string;
    imageId: ObjectId;
    email: string;
}
