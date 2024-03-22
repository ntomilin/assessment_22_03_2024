import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { UserDto } from '../dto/User.dto';
import { ObjectId } from 'mongodb'

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async createUser({ name, imageId, email }: UserDto): Promise<UserDocument> {
        return this.userModel.create({
            name,
            imageId,
            email
        });
    }

    async getUser(id: ObjectId): Promise<User> {
        return this.userModel.findById(id).exec();
    }

    async deleteAvatar(id: ObjectId) {
        return this.userModel.updateOne({
            _id: id
        }, {
            imageId: null
        })
    }
}
