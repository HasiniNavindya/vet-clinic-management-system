import { API_BASE_URL, authHeaders } from './api';
import type { BlogCategory } from './blog';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : 'Invalid response');
  }
}

export interface AdminBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string | null;
  category: BlogCategory;
  readTime: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminBlogPostInput = {
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  author?: string;
  category?: BlogCategory | string;
  readTime?: string;
  publishedAt?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  slug?: string;
};

export async function fetchAdminBlogPosts(token: string): Promise<{
  posts: AdminBlogPost[];
  categories: string[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts`, { headers: authHeaders(token) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load blog posts');
  return data as { posts: AdminBlogPost[]; categories: string[] };
}

export async function createAdminBlogPost(
  token: string,
  body: AdminBlogPostInput
): Promise<{ post: AdminBlogPost }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to create post');
  return data as { post: AdminBlogPost };
}

export async function patchAdminBlogPost(
  token: string,
  id: number,
  body: Partial<AdminBlogPostInput>
): Promise<{ post: AdminBlogPost }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to update post');
  return data as { post: AdminBlogPost };
}

export async function deleteAdminBlogPost(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/blog/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to delete post');
}
