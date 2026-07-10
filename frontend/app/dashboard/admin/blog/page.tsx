'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog';
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPosts,
  patchAdminBlogPost,
  uploadBlogCoverImage,
  type AdminBlogPost,
} from '@/lib/adminBlog';
import { blogImageUrl } from '@/lib/blog';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  author: 'Carlisle Pet Care',
  category: 'health' as BlogCategory,
  readTime: '5 min read',
  isPublished: true,
  isFeatured: false,
};

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export default function AdminBlogPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchAdminBlogPosts(token);
      setPosts(r.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview(null);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be 8 MB or smaller.');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const { imageUrl } = await uploadBlogCoverImage(token, file);
      setForm((f) => ({ ...f, image: imageUrl }));
      setImagePreview(blogImageUrl(imageUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    try {
      const body = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        image: form.image.trim(),
        author: form.author.trim(),
        category: form.category,
        readTime: form.readTime.trim() || '5 min read',
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
      };
      if (editingId) {
        await patchAdminBlogPost(token, editingId, body);
      } else {
        await createAdminBlogPost(token, body);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const startEdit = (p: AdminBlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      image: p.image,
      author: p.author,
      category: (p.category === 'all' ? 'health' : p.category) as BlogCategory,
      readTime: p.readTime,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
    });
    setImagePreview(p.image ? blogImageUrl(p.image) : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePublish = async (p: AdminBlogPost) => {
    if (!token) return;
    try {
      await patchAdminBlogPost(token, p.id, { isPublished: !p.isPublished });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  const remove = async (id: number) => {
    if (!token || !confirm('Delete this blog post permanently?')) return;
    try {
      await deleteAdminBlogPost(token, id);
      if (editingId === id) resetForm();
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-2 text-gray-900">Blog management</h1>
        <p className="text-gray-600">
          Create and publish articles for the public blog at{' '}
          <Link href="/blog" className="font-semibold text-[#ec6d13] hover:underline">
            /blog
          </Link>
          .
        </p>

        <form onSubmit={submit} className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? `Edit post #${editingId}` : 'New blog post'}
          </h2>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Title *</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">URL slug (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="auto-generated from title"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Category</span>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as BlogCategory }))}
              >
                {BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Excerpt *</span>
              <textarea
                required
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Full content</span>
              <textarea
                rows={6}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </label>
            <div className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Cover image</span>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition ${
                    uploadingImage
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-[#ec6d13]/40 bg-orange-50/30 hover:border-[#ec6d13] hover:bg-orange-50/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={handleCoverUpload}
                  />
                  {uploadingImage ? (
                    <span className="text-sm font-semibold text-gray-600">Uploading…</span>
                  ) : (
                    <>
                      <span className="text-2xl text-[#ec6d13]">↑</span>
                      <span className="mt-2 text-sm font-semibold text-[#b6530f]">
                        Upload cover image
                      </span>
                      <span className="mt-1 text-xs text-gray-500">JPG, PNG, WebP or GIF · max 8 MB</span>
                    </>
                  )}
                </label>
                {(imagePreview || form.image) ? (
                  <div className="relative min-w-0 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview || blogImageUrl(form.image)}
                      alt="Cover preview"
                      className="max-h-40 w-full rounded-xl border border-gray-200 object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, image: '' }));
                        setImagePreview(null);
                      }}
                      className="mt-2 text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Author</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Read time</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.readTime}
                onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Published (visible on public blog)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Featured article (blog hero)</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-[#ec6d13] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
            >
              {editingId ? 'Save changes' : 'Create post'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900">All posts ({posts.length})</h2>
          {loading ? (
            <p className="mt-4 text-gray-500">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="mt-4 text-gray-500">No posts yet. Create your first article above.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {posts.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge published={p.isPublished} />
                      {p.isFeatured ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-[#ec6d13]">
                          Featured
                        </span>
                      ) : null}
                      <span className="text-xs capitalize text-gray-500">{p.category}</span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">
                      /blog/{p.slug}
                      {p.isPublished ? (
                        <>
                          {' '}
                          ·{' '}
                          <Link href={`/blog/${p.slug}`} className="text-[#ec6d13] hover:underline" target="_blank">
                            View live
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(p)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {p.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
    </div>
  );
}
