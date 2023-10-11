export type SingleCommentResponseDTO = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  imageURL?: string;
  likeCount: number;
  liked: boolean;
};

export type MultipleCommentResponseDTO = {
  list: SingleCommentResponseDTO[];
  page: number;
  totalPage: number;
};
