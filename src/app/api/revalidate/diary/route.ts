import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  const body = await req.json();
  const id = body.id;

  if (!id) {
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
