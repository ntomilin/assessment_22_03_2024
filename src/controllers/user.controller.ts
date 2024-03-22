import { Controller, Get, Post } from '@nestjs/common';

@Controller()
export class UserController {
  constructor() {}

  @Post('/users')
  createUser(): any {
    return '';
  }

  @Get('/user/:userId')
  getUserById(): any {
    return '';
  }

  @Get()
  getUserAvatar(): any {
    return '';
  }

  @Get()
  deleteUserAvatar(): any {
    return '';
  }
}
