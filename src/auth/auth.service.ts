import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { Users } from "@prisma/client";
import { CreateUserDto, SignInUserDto } from "../user/dto";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService
  ) {}

  private async genereteTokens(user: Users) {
    const paylod = {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(paylod, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME as any,
      }),

      this.jwtService.sign(paylod, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME as any,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async signup(createUserDto: CreateUserDto) {
    const candidate = await this.prismaService.users.findUnique({
      where: { email: createUserDto.email },
    });
    if (candidate) {
      throw new ConflictException("Bunday foydalanuvchi majud");
    }

    const newUser = await this.userService.create(createUserDto);
    return {
      message: "User created",
      userId: newUser.id,
    };
  }

  async signin(signinUserDto: SignInUserDto, res: Response) {
    const user = await this.prismaService.users.findUnique({
      where: { email: signinUserDto.email },
    });
    if (!user) {
      throw new UnauthorizedException("Email yoki parol notog'ri");
    }
    const confirmPassword = await bcrypt.compare(
      signinUserDto.password,
      user.hashedPassword
    );
    if (!confirmPassword) {
      throw new UnauthorizedException("Email yoki parol notog'ri");
    }

    const { accessToken, refreshToken } = await this.genereteTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);

    await this.prismaService.users.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    return { message: "User signed in", id: user.id, accessToken };
  }

  async refreshTokens(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException("Token topilmadi");
    }

    const payload = await this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });

    const user = await this.prismaService.users.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException("Foydalanuvchi topilmadi");
    }
    const isMatch = await bcrypt.compare(token, user.hashedRefreshToken);
    if (!isMatch) {
      throw new UnauthorizedException("Refresh token notogri");
    }
    const { accessToken, refreshToken } = await this.genereteTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);

    await this.prismaService.users.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    return { accessToken };
  }

  async signOut(refreshToken: string, res: Response) {
    const userDate = await this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    if (!userDate) {
      throw new ForbiddenException("User not varified");
    }
    const user = await this.userService.findOne(userDate.id);
    if (!user) {
      throw new BadRequestException("Notog'ri token");
    }
    const hashedRefreshToken = "";
    await this.prismaService.users.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    res.clearCookie("refreshToken");
    return {
      message: "User Loged out",
    };
  }
}
