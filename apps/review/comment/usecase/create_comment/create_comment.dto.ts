import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDTO {
  @IsNotEmpty()
  reviewId: string;

  // parentCommentId: string;

  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40000)
  content: string;

  image: Express.Multer.File;
}
