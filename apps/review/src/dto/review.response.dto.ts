export type SingleReviewResponseDTO = {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  place: {
    place_id: string;
    place_name: string;
    province_code: string;
    province_name: string;
  };
  title: string;
  description: string;
  rating: number;
  imageURLs: string[];
  likes_count: number;
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
