import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Content } from '../entities/content.entity';
import { ContentType } from '../dto/create-content.dto';

@Injectable()
export class ContentSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
        map((data) => {
          
          if (
              Array.isArray(data) &&
              data.length === 2 &&
              Array.isArray(data[0]) &&
              typeof data[1] === 'number'
          ) {
            const [items, count] = data;
            return [items.map((item) => this.serializeContent(item)), count];
          }

          
          if (Array.isArray(data)) {
            return data.map((item) => this.serializeContent(item));
          }

          
          if (data && typeof data === 'object') {
            return this.serializeContent(data);
          }

          return data;
        }),
    );
  }

  private serializeContent(content: any): Partial<Content> {
    if (typeof content !== 'object' || content === null) {
      return content;
    }

    const serializedContent: Partial<Content> = { ...content };

    
    

    switch (serializedContent.type) {
      case ContentType.TEXT:
        delete serializedContent.fileUrl;
        delete serializedContent.questions;
        
        delete serializedContent.groupInstructorId;
        break;
      case ContentType.FILE:
        delete serializedContent.text;
        delete serializedContent.questions;
        
        delete serializedContent.groupInstructorId;
        break;
      case ContentType.QUIZ:
        delete serializedContent.text;
        delete serializedContent.fileUrl;
        
        delete serializedContent.groupInstructorId;
        break;
      case ContentType.GROUP:
        delete serializedContent.text;
        delete serializedContent.fileUrl;
        delete serializedContent.questions;
        break;
      default:
        break;
    }
    return serializedContent;
  }
}