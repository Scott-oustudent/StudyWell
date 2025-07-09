// netlify/functions/set-data.ts
import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing 'key' query parameter" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    
    const data = await req.json();
    const store = getStore("studywell-data");
    await store.setJSON(key, data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    console.error(`Error in set-data function:`, errorMessage);
    
    return new Response(JSON.stringify({ error: "Failed to process request.", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
