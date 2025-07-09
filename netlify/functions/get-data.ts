// netlify/functions/get-data.ts
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      // This is a client error, a 400 is appropriate.
      return new Response(JSON.stringify({ error: "Missing 'key' query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("studywell-data");
    const data = await store.get(key, { type: "json" });

    // Successfully got data (or null if not found), return 200 OK.
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // This catches any server-side error (DB connection, parsing corrupted data, etc.)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`A server-side error occurred in get-data. Returning null. Details:`, errorMessage);

    // IMPORTANT: Return 200 OK with a null body to prevent frontend from crashing.
    // The frontend handles 'null' as "no data found".
    return new Response("null", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
