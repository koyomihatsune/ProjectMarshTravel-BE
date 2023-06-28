import { Injectable } from '@nestjs/common';

@Injectable()
export class DestinationService {
  getHello(): string {
    return 'Hello World!';
  }
}
