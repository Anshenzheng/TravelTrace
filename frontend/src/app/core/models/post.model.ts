export enum PostStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Post {
  id: number;
  userId: number;
  username: string;
  userNickname: string;
  userAvatar: string;
  cityId: number | null;
  cityName: string | null;
  title: string;
  content: string;
  coverImage: string;
  images: string[];
  status: PostStatus;
  rejectReason: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  cityId?: number;
  title: string;
  content: string;
  coverImage?: string;
  images?: string[];
  asDraft?: boolean;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  postId: number;
  parentId: number | null;
  content: string;
  replies: Comment[];
  createdAt: string;
}

export interface CreateCommentRequest {
  postId: number;
  parentId?: number;
  content: string;
}

export interface AuditRequest {
  postId: number;
  approved: boolean;
  reason?: string;
}
