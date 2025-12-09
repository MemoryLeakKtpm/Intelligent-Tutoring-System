import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { GetContentFilterDto } from './dto/get-content-filter.dto';
import { Content } from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
      @InjectRepository(Content)
      private contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: CreateContentDto, creatorId: string): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      creatorId,
    });
    return this.contentRepository.save(content);
  }

  async findAll(filterDto: GetContentFilterDto): Promise<[Content[], number]> {
    
    const page = Number(filterDto.page) || 1;
    const limit = Number(filterDto.limit) || 10;
    const { instructorId, parentContentId, isRoot } = filterDto;

    const query = this.contentRepository.createQueryBuilder('content');

    if (instructorId) {
      query.andWhere('content.groupInstructorId = :instructorId', { instructorId });
    }

    
    if (parentContentId) {
      query.andWhere('content.parentContentId = :parentContentId', { parentContentId });
    } else if (isRoot === 'true') {
      
      query.andWhere('content.parentContentId IS NULL');
    }

    
    const skip = (page - 1) * limit;

    const [content, total] = await query
        .orderBy('content.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

    return [content, total];
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['children']
    });
    if (!content) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }
    return content;
  }

  async findMultiple(ids: string[]): Promise<Content[]> {
    return this.contentRepository.findByIds(ids);
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id);
    if (updateContentDto.type) delete updateContentDto.type;
    this.contentRepository.merge(content, updateContentDto);
    return this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }
  }
}