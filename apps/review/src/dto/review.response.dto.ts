export type SingleReviewResponseDTO = {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  destination: {
    place_id: string;
    name: string;
    address: string;
    province_code: string;
    province_name: string;
  };
  title: string;
  description: string;
  rating: number;
  imageURLs: string[];
  likes_count: number;
  liked: boolean;
  comments_count: number;
  highlighted_comments: {
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    imageUrl: string;
  }[];
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MultipleReviewResponseDTO = {
  reviews: SingleReviewResponseDTO[];
};

export type MultipleCommentResponseDTO = {
  comments: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    imageUrl: string;
  }[];
};
