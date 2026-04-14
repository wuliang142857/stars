// ABOUTME: Account credentials management API backed by Cloudflare D1.
// ABOUTME: Provides authenticated REST endpoints to query stored account data by type.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 2026-04-14: Route requests to appropriate handlers
    if (url.pathname === "/api/accounts") {
      if (request.method === "GET") {
        return handleGetAccounts(request, env);
      }
      // 2026-04-14: Support POST to add new account credentials
      if (request.method === "POST") {
        return handleCreateAccount(request, env);
      }
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};

/**
 * 2026-04-14: Verify Bearer token against the API_KEY secret
 * Returns true if the authorization header contains a valid token.
 */
function authenticate(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return false;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return false;
  }

  return parts[1] === env.API_KEY;
}

/**
 * 2026-04-14: Handle GET /api/accounts?type=cloudflare
 * Queries D1 for accounts matching the specified type.
 */
async function handleGetAccounts(request, env) {
  if (!authenticate(request, env)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (!type) {
    return jsonResponse({ error: "Missing required query parameter: type" }, 400);
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT account_id, email, password, api_key FROM accounts WHERE type = ?"
    )
      .bind(type)
      .all();

    return jsonResponse({ type, count: results.length, accounts: results });
  } catch (err) {
    return jsonResponse({ error: "Internal Server Error", message: err.message }, 500);
  }
}

/**
 * 2026-04-14: Handle POST /api/accounts to add new account credentials
 * Expects JSON body: { type, account_id, email, password?, api_key }
 * Also supports batch creation with an array of accounts.
 */
async function handleCreateAccount(request, env) {
  if (!authenticate(request, env)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // 2026-04-14: Normalize single object to array for uniform processing
  const items = Array.isArray(body) ? body : [body];

  const requiredFields = ["type", "account_id", "email", "api_key"];
  for (const item of items) {
    for (const field of requiredFields) {
      if (!item[field]) {
        return jsonResponse({ error: `Missing required field: ${field}` }, 400);
      }
    }
  }

  try {
    // 2026-04-14: Include optional password field in insert
    const stmt = env.DB.prepare(
      "INSERT INTO accounts (type, account_id, email, password, api_key) VALUES (?, ?, ?, ?, ?)"
    );
    const batch = items.map((item) =>
      stmt.bind(item.type, item.account_id, item.email, item.password || "", item.api_key)
    );
    await env.DB.batch(batch);

    return jsonResponse({ success: true, inserted: items.length }, 201);
  } catch (err) {
    return jsonResponse({ error: "Internal Server Error", message: err.message }, 500);
  }
}

/**
 * 2026-04-14: Helper to create JSON responses with proper headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
