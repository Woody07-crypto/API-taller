export type PostStatus = 'draft' | 'pending' | 'publish' | 'private' | 'trash';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: PostStatus;
  author_id: string;
  published_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePostDTO {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  author_id: string;
  status?: PostStatus;
}

export interface UpdatePostDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  status?: PostStatus;
}

export const VALID_STATUSES: PostStatus[] = ['draft', 'pending', 'publish', 'private', 'trash'];
