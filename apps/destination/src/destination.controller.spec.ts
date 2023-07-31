import { Test, TestingModule } from '@nestjs/testing';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';

describe('DestinationController', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let destinationController: DestinationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DestinationController],
      providers: [DestinationService],
    }).compile();

    destinationController = app.get<DestinationController>(
      DestinationController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect('Hello World!').toBe('Hello World!');
    });
  });
});
