import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

function saavnDevProxy() {
  return {
    name: "saavn-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl || req.url;
        if (url && url.startsWith("/saavn-api")) {
          const targetPath = url.replace(/^\/saavn-api/, "");
          const targetUrl = `https://www.jiosaavn.com${targetPath}`;
          try {
            const apiRes = await fetch(targetUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json, text/plain, */*",
              },
            });
            const data = await apiRes.text();
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = apiRes.status;
            res.end(data);
          } catch (err) {
            console.error("Vite Saavn proxy error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/saavn-api")) {
          const targetPath = req.url.replace(/^\/saavn-api/, "");
          const targetUrl = `https://www.jiosaavn.com${targetPath}`;
          try {
            const apiRes = await fetch(targetUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json, text/plain, */*",
              },
            });
            const data = await apiRes.text();
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = apiRes.status;
            res.end(data);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), saavnDevProxy()],

  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
