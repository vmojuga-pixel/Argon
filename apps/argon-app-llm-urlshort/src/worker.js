export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const codeMap = new Map();

    if (url.pathname === '/health') {
      return new Response('HEALTHY', { status: 200 });
    }

    if (request.method === 'POST' && url.pathname === '/shorten') {
      const requestBody = await request.json();
      if (!requestBody.url) {
        return new Response('Missing URL in request body', { status: 400 });
      }

      const code = Math.random().toString(36).slice(2, 10);
      codeMap.set(code, requestBody.url);

      const response = {
        code,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
      });
    }

    if (request.method === 'GET' && codeMap.has(url.pathname.slice(1))) {
      const targetUrl = codeMap.get(url.pathname.slice(1));
      return Response.redirect(targetUrl, 302);
    }

    if (request.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};