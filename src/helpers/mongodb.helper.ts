import { ObjectId } from 'mongodb'

export const toObjectId = (id: string): ObjectId => new ObjectId(id);
