import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UserDocument = HydratedDocument<User>;

@Schema({
    versionKey: false,
})
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    imageId: ObjectId;

    @Prop({ required: true })
    email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
