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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { GetContentFilterDto } from './dto/get-content-filter.dto';
import { GetMultipleContentDto } from './dto/get-multiple-content.dto';
import { AuthGuard } from '@nestjs/passport';
import { ContentSerializationInterceptor } from './interceptors/content-serialization.interceptor';
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
  @UseInterceptors(ContentSerializationInterceptor)
  @Get()
  findAll(@Query() filterDto: GetContentFilterDto) {
    return this.contentService.findAll(filterDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ContentSerializationInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(ContentSerializationInterceptor)
  @Post('multiple')
  findMultiple(@Body() getMultipleContentDto: GetMultipleContentDto) {
    return this.contentService.findMultiple(getMultipleContentDto.ids);
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
