import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { ObjectId } from 'mongodb';
import { UserAvatarService } from '../../src/services/user_avatar.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../src/schemas/user.schema';
import { UserAvatarSchema } from '../../src/schemas/user_avatar.schema';
import { MulterFile } from '../data/user.controller.data';
import { StreamableFile } from '@nestjs/common';

describe('UserController', () => {
    let userController: UserController;
    let userService: UserService;
    let userAvatarService: UserAvatarService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [
                UserController
            ],
            providers: [
                UserService,
                UserAvatarService,
            ],
            imports: [
                MongooseModule.forRoot('mongodb://localhost/assessment_22_03_2024_MT_Tests'),
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: 'fs.files', schema: UserAvatarSchema },
                ]),
            ]
        }).compile();

        userService = app.get<UserService>(UserService);
        userAvatarService = app.get<UserAvatarService>(UserAvatarService);
        userController = app.get<UserController>(UserController);
    });

    describe('Test user creation', () => {
        it('Simply create user', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com' };

            const createdUser = { _id: new ObjectId(), ...userData }; // Mock the created user object

            // @ts-ignore
            jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

            const result = await userController.createUser(MulterFile, userData);

            expect(result).toEqual(createdUser);
        });

        it('Create & get user', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com' };
            // @ts-ignore
            const id = new ObjectId();
            const imageId =  new ObjectId();

            const createdUser = { _id: id, ...userData, imageId }; // Mock the created user object

            // @ts-ignore
            jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);
            jest.spyOn(userService, 'getUser').mockResolvedValue({
                ...createdUser,
            });

            const createResult = await userController.createUser(MulterFile, userData);
            const fetchResult = await userController.getUserById(id.toString());

            expect(createResult).toEqual(fetchResult);
        });

        it('Create user & get avatar', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com' };
            const id = new ObjectId();
            const imageId =  new ObjectId();

            const createdUser = { _id: id, ...userData, imageId }; // Mock the created user object

            // @ts-ignore
            jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);
            jest.spyOn(userService, 'getUser').mockResolvedValue({
                ...createdUser,
            });
            const fileBuffer = Buffer.from('somefilehere');
            const stream = new StreamableFile(fileBuffer);
            // @ts-ignore
            jest.spyOn(userAvatarService, 'get').mockResolvedValue(new StreamableFile(fileBuffer));

            const fetchResult = await userController.getUserAvatar(id.toString());

            // I'm not sure how check this one tbh
        });

        it('Create user & remove avatar', async () => {
            const userData = { name: 'John Doe', email: 'john@example.com' };
            const id = new ObjectId();
            const imageId =  new ObjectId();

            const createdUser = { _id: id, ...userData, imageId }; // Mock the created user object

            // @ts-ignore
            jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);
            jest.spyOn(userService, 'getUser').mockResolvedValue({
                ...createdUser,
            });
            const fileBuffer = Buffer.from('somefilehere');
            // @ts-ignore
            jest.spyOn(userAvatarService, 'get').mockResolvedValue({});


            jest.spyOn(userService, 'deleteAvatar').mockResolvedValue(Promise.resolve({
                acknowledged: true,
                matchedCount: 1,
                modifiedCount: 1,
                upsertedCount: 0,
                upsertedId: undefined,
            }));
            jest.spyOn(userAvatarService, 'deleteForUser').mockResolvedValue();
            const fetchResult = await userController.deleteUserAvatar(id.toString());

            // @ts-ignore
            expect(fetchResult).toEqual({ success: true });
        });
    });
});
