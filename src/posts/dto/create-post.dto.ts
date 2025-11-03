import { IsNotEmpty, IsOptional, IsString, IsInt } from "class-validator";

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  usersId?: number;
}
