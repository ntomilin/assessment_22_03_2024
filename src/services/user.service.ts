import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model, Document } from 'mongoose';
import { UserDto } from '../dto/user.dto';
import { GridFSBucket, ObjectId } from 'mongodb'
import { toObjectId } from '../helpers/mongodb.helper';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async createUser({ name, imageId, email }: UserDto): Promise<UserDocument> {
        return this.userModel.create({
            name,
            imageId: toObjectId(imageId),
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
