import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthFromRequest } from '@/lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') ?? formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const blob = file as Blob;
    const buffer = Buffer.from(await blob.arrayBuffer());

    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const type = blob.type?.toLowerCase();
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' },
        { status: 400 }
      );
    }

    const ext = type === 'image/jpeg' ? '.jpg' : type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.gif';
    const name = `course-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, name);
    await writeFile(filePath, buffer);

    const url = `/uploads/${name}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
  }
}
