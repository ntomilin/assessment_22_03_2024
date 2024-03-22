import {
    Body,
    Controller, Delete,
    Get,
    HttpCode, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder,
    Post, StreamableFile,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { toObjectId } from '../helpers/mongodb.helper';
import { UserAvatarService } from '../services/user_avatar.service';
import { CreateUserDto } from '../dto/CreateUser.dto';


@Controller()
export class UserController {
    constructor(private userService: UserService,
                private userAvatarService: UserAvatarService) {
    }

    @Post('/users')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(201)
    async createUser(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
        ) file: Express.Multer.File,
        @Body() userBody: CreateUserDto,
    ): Promise<any> {
        const imageId = await this.userAvatarService.store(file);
        return this.userService.createUser({
            ...userBody,
            imageId: toObjectId(imageId)
        });
    }

    @Get('/users/:userId')
    async getUserById(@Param('userId') userId: string): Promise<any> {
        return this.userService.getUser(toObjectId(userId))
    }

    // I think /userS/:userId/avatar would be better
    @Get('/user/:userId/avatar')
    async getUserAvatar(
        @Param('userId') userId: string,
    ) {
        const userData = await this.userService.getUser(toObjectId(userId));

        if (!userData) {
            throw new NotFoundException('User not found');
        }

        const { imageId } = userData;
        const avatarInfo = await this.userAvatarService.get(imageId);

        if (!avatarInfo) {
            throw new NotFoundException('Avatar not found');
        }

        const downloadStream = this.userAvatarService.getStream(imageId);

        return new StreamableFile(downloadStream, {
            length: avatarInfo.length,
        });
    }

    // I think /userS/:userId/avatar would be better
    @Delete('user/:userId/avatar')
    async deleteUserAvatar(@Param('userId') userId: string): Promise<any> {
        const userObjectId = toObjectId(userId);
        const userData = await this.userService.getUser(userObjectId);

        if (!userData) {
            throw new NotFoundException('User not found');
        }

        const { imageId } = userData;
        const avatarInfo = await this.userAvatarService.get(imageId);

        if (!avatarInfo) {
            throw new NotFoundException('Avatar not found');
        }

        await Promise.all([
            this.userAvatarService.deleteForUser(toObjectId(avatarInfo.id)),
            this.userService.deleteAvatar(userObjectId)
        ]);

        return { success: true };
    }
}
