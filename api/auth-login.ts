export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const backendResponse = await fetch(
    'https://crossword-backend.onrender.com/login',
    {
      method: req.method,
      headers: req.headers,
      body: req.body,
    }
  );

  const headers = new Headers(backendResponse.headers);
  const body = backendResponse.body;
  return new Response(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  });
}
