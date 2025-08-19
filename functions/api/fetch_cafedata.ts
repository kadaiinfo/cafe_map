/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction<{ "cafe-map": KVNamespace }> = async (ctx) => {
    try {
      const text = await ctx.env["cafe-map"].get("cafe_data_kv.json", { type: "text" })
      if (!text) {
        return new Response("not found", { status: 404 })
      }
      // 軽い検証（壊れたJSONを返さない）
      JSON.parse(text)
  
      return new Response(text, {
        headers: {
          "content-type": "application/json; charset=utf-8",
          // キャッシュはお好みで調整
          "cache-control": "max-age=60, stale-while-revalidate=30",
        },
      })
    } catch (e) {
      return new Response("internal error", { status: 500 })
    }
  }
  