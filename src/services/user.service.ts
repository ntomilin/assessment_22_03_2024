import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async createUser(name: string, imagePath: string, email: string): Promise<User> {
        return this.userModel.create({
            name,
            imagePath,
            email
        });
    }

    async getUser(id: ObjectId): Promise<User> {
        return this.userModel.findById(id).exec();
    }

    async deleteUserAvatar(): Promise<any> {

    }

    async getUserAvatar(): Promise<any> {

    }
}
