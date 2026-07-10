import { apiFetch, API_BASE_URL } from './api';

/** Resolve blog cover path for display (uploads, site assets, or external URLs). */
export function blogImageUrl(imagePath?: string | null): string {
  if (!imagePath?.trim()) return '/images/services/care-advice.jpg';
  const p = imagePath.trim();
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/')) return `${API_BASE_URL}${p}`;
  return p;
}

export type BlogCategory = 'all' | 'health' | 'nutrition' | 'training' | 'lifestyle' | 'news';

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  publishedAt: string;
  category: BlogCategory;
  readTime: string;
  isFeatured?: boolean;
};

export type BlogPostDisplay = BlogPost & {
  date: string;
  dateBadge: { day: string; month: string };
};

export function formatBlogDateLong(publishedAt: string) {
  return new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatBlogDateBadge(publishedAt: string) {
  const d = new Date(publishedAt);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export function toDisplayPost(post: BlogPost): BlogPostDisplay {
  return {
    ...post,
    date: formatBlogDateLong(post.publishedAt),
    dateBadge: formatBlogDateBadge(post.publishedAt),
  };
}

export async function fetchBlogPosts(limit?: number, category?: BlogCategory) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (category && category !== 'all') params.set('category', category);
  const qs = params.toString();
  return apiFetch<{ posts: BlogPost[] }>(`/api/public/blog-posts${qs ? `?${qs}` : ''}`);
}

export async function fetchBlogPostBySlug(slug: string) {
  return apiFetch<{ post: BlogPost }>(`/api/public/blog-posts/${slug}`);
}

export const BLOG_CATEGORIES: { id: BlogCategory; name: string }[] = [
  { id: 'all', name: 'All Posts' },
  { id: 'health', name: 'Health' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'training', name: 'Training' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'news', name: 'News' },
];
