import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class UpdateCommentDTO {
  @IsNotEmpty()
  commentId: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40000)
  content: string;
}
