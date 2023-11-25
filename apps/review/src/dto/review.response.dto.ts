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
  saved: boolean;
  comments_count: number;
  highlighted_comments: {
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    imageUrl?: string;
  }[];
  isApproved: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MultipleReviewResponseDTO = {
  list: SingleReviewResponseDTO[];
  page: number;
  totalPage: number;
  averageRating?: number;
};

// Phần này dành cho lấy list saved reviews
export type SingleReviewPreviewResponseDTO = {
  id: string;
  title: string;
  rating: number;
  firstImageURL: string;
  destination: {
    place_id: string;
    name: string;
  };
};

export type MultipleReviewPreviewResponseDTO = {
  list: SingleReviewPreviewResponseDTO[];
  page: number;
  totalPage: number;
};

export type MultipleCommentResponseDTO = {
  list: {
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
