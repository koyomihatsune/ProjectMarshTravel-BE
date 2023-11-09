import { IsNotEmpty } from 'class-validator';

export class AddPhoneNumberToRegistrationQueueDTO {
  @IsNotEmpty()
  phoneNumber: string;
}
