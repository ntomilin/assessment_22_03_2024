import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, mongo } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb'

import * as fs from 'fs';
import { FileModel } from '../schemas/user_avatar.schema';
import { Transform } from 'stream';

@Injectable()
export class UserAvatarService {
    private readonly bucket: GridFSBucket

    constructor(@InjectModel('fs.files') private userAvatarModel: Model<FileModel>,
                @InjectConnection() private readonly connection: Connection,
    ) {
        this.bucket = new mongo.GridFSBucket(this.connection.db);
    }

    store(file: Express.Multer.File): Promise<string> {
        const id = new ObjectId();
        const fileStream = fs.createReadStream(file.path)

        return new Promise((resolve, reject) => {
            try {
                const transformStream = new Transform({
                    transform(chunk, encoding, callback) {
                        const base64Chunk = chunk.toString('base64');
                        this.push(base64Chunk);
                        callback();
                    }
                });

                const uploadStream = this.bucket.openUploadStreamWithId(
                    id,
                    file.filename,
                    {
                        contentType: file.mimetype,
                    },
                )

                transformStream.pipe(uploadStream);

                fileStream.on('end', () => {
                    resolve(uploadStream.id.toString())
                })

                fileStream.pipe(transformStream)
            } catch (err) {
                reject(err);
            }
        });
    }

    get(imageId: ObjectId) {
        return this.userAvatarModel.findOne({ _id: imageId }).exec();
    }

    getStream(id: ObjectId) {
        return this.bucket.openDownloadStream(id);
    }

    deleteForUser(id: ObjectId) {
        return this.bucket.delete(id);
    }
}
