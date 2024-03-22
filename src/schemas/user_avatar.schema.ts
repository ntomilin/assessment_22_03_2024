import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class FileModel {
    @Prop()
    length: number;

    @Prop()
    chunkSize: number;

    @Prop()
    uploadDate: Date;

    @Prop()
    filename: string;

    @Prop()
    md5: string;

    @Prop()
    contentType: string;
}

export const UserAvatarSchema = SchemaFactory.createForClass(FileModel);
