import { IsNotEmpty } from 'class-validator';

export class DeleteCommentDTO {
  @IsNotEmpty()
  commentId: string;
}
