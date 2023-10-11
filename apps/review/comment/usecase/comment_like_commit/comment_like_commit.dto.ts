import { IsNotEmpty } from 'class-validator';

export class LikeCommitCommentDTO {
  @IsNotEmpty()
  commentId: string;

  @IsNotEmpty()
  like: boolean;
}
