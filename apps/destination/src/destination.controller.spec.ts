import { Test, TestingModule } from '@nestjs/testing';
import { DestinationController } from './destination.controller';
import { DestinationService } from './destination.service';

describe('DestinationController', () => {
  let destinationController: DestinationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DestinationController],
      providers: [DestinationService],
    }).compile();

    destinationController = app.get<DestinationController>(DestinationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(destinationController.getHello()).toBe('Hello World!');
    });
  });
});
