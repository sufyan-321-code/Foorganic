import { supabase } from '../lib/supabase';

const BUCKET = 'product-images';

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName !== file.name.toLowerCase()) return fromName;

  const mimeExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeExt[file.type] || 'jpg';
}

export function isManagedProductImage(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return url.pathname.includes(`/${BUCKET}/`);
  } catch {
    return false;
  }
}

export function extractStoragePathFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = `/${BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be signed in to upload images');
  }

  const ext = getFileExtension(file);
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!isManagedProductImage(imageUrl)) return;

  const path = extractStoragePathFromUrl(imageUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
