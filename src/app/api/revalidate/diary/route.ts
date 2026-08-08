import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  let id: unknown;
  try {
    const body = await req.json();
    id = body?.id;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400,
    });
  }

  // 숫자 id 만 허용 — 경로 조작(`../..` 등) 방지.
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
    });
  }

  revalidatePath(`/diary/${id}`); // 해당 경로 리빌드

  return new Response(
    JSON.stringify({ revalidated: true, path: `/diary/${id}` }),
    {
      status: 200,
    }
  );
}
