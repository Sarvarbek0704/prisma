import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, UpdatePostDto } from "./dto";

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    return this.prisma.posts.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        usersId: createPostDto.usersId,
      },
    });
  }

  async findAll() {
    return this.prisma.posts.findMany({
      include: { Users: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.posts.findUnique({
      where: { id },
      include: { Users: true },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return this.prisma.posts.update({
      where: { id },
      data: {
        title: updatePostDto.title,
        content: updatePostDto.content,
        usersId: updatePostDto.usersId,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.posts.delete({
      where: { id },
    });
  }
}
