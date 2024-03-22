import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { User, UserSchema } from '../schemas/user.schema';
import { MulterModule } from '@nestjs/platform-express';
import { UserAvatarService } from '../services/userAvatar.service';
import { UserAvatarSchema } from '../schemas/userAvatar.schema';
import { RMQModule } from './rmq/rmq.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/assessment_22_03_2024_MT'),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: 'fs.files', schema: UserAvatarSchema },
        ]),
        MulterModule.register({
            dest: './dist/upload',
        }),
        RMQModule,
    ],
    controllers: [
        UserController,
    ],
    providers:
        [
            UserService,
            UserAvatarService,
        ],
})

export class AppModule {
}
