export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      if (request.url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'OK' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Health Check</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-100 flex justify-center items-center h-screen">
            <div class="bg-white p-4 rounded-md shadow-md">
              <h1 class="text-lg font-bold mb-2">Health Check</h1>
              <p class="text-green-500">Status: OK</p>
            </div>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
};