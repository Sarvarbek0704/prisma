import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { CreateUserDto, SignInUserDto } from "../user/dto";
import type { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post("signin")
  async signin(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signin(signInUserDto, res);
  }
}
