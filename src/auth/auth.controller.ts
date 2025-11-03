import { Controller, Post, Body, Res, Req, Param } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, SignInUserDto } from "../user/dto";
import type { Request, Response } from "express";
import { CookieGetter } from "../common/decorators/cookie.getter.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post("signin")
  signin(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signin(signInUserDto, res);
  }

  @Post("refresh")
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshTokens(req, res);
  }

  @Post("signout")
  signout(
    @CookieGetter("refreshToken") refreshToken: string,
    @Param("id") id: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signOut(refreshToken, res);
  }
}
