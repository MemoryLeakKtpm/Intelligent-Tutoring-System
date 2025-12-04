import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: './data/files' }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { filename: file.filename, path: file.path };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  create(@Body() createContentDto: CreateContentDto, @Request() req) {
    return this.contentService.create(createContentDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.contentService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, updateContentDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
