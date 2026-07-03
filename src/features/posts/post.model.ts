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

export type OrderByField = 'created_at' | 'updated_at' | 'title';
export type OrderDirection = 'asc' | 'desc';

export const VALID_ORDERBY_FIELDS: OrderByField[] = ['created_at', 'updated_at', 'title'];
export const VALID_ORDER_DIRECTIONS: OrderDirection[] = ['asc', 'desc'];

export interface PostQueryParams {
  page: number;
  per_page: number;
  search?: string;
  status?: PostStatus;
  author?: string;
  orderby: OrderByField;
  order: OrderDirection;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PostPublic {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: PostStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toPostPublic(post: Post): PostPublic {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    slug: post.slug,
    status: post.status,
    author_id: post.author_id,
    published_at: post.published_at?.toISOString() ?? null,
    created_at: post.created_at.toISOString(),
    updated_at: post.updated_at.toISOString()
  };
}
