# ARGON-APP-HELLO-001

- Directive: Create a hello utility module with tests
- Target repo: `vmojuga-pixel/Argon`
- Files scanned: 276
- Detected stack: Cloudflare Workers, Node.js, Python, React/Next.js, SQL
- AI note: Berikut adalah contoh modul utiliti "hello" dalam JavaScript, beserta dengan tesnya menggunakan Jest:

**hello.js**
'''javascript
/**
 * Modul utiliti hello
 */

function hello(name) {
  return 'Halo, ${name}!';
}

function greet() {
  console.log('Halo, dunia!');
}

module.exports = { hello, greet 

## Auto-generated files
1. `apps/argon-app-hello-001/src/worker.js` — full-stack bundle
2. `apps/argon-app-hello-001/db/schema.sql` — SQL schema
3. `apps/argon-app-hello-001/openapi.json` — API contract
4. `apps/argon-app-hello-001/wrangler.toml` — deploy config
