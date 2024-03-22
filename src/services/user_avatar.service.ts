import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
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

    private streamToBase64(stream: fs.ReadStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer.toString('base64'));
            });
            stream.on('error', reject);
        });
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

    getStream(id: ObjectId, opts: { start?: number; end?: number } = {}) {
        return this.bucket.openDownloadStream(id);
        // return this.bucket.openDownloadStream(id, opts);
    }

    getList() {
        return this.userAvatarModel.find().exec()
    }

    deleteForUser(id: ObjectId) {
        return this.bucket.delete(id);
    }
}
