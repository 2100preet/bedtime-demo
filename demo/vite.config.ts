import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const demoDir = path.dirname(fileURLToPath(import.meta.url));

/** Project Pages sites live at /<repo>/. A user site named <owner>.github.io stays at /. */
export function pagesBase() {
  if (process.env.GITHUB_PAGES !== "true") return "/";
  const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1] || process.env.REPO_NAME || "bedtime-demo";
  const owner = process.env.GITHUB_REPOSITORY_OWNER || "";
  if (repo === `${owner}.github.io`) return "/";
  return `/${repo}/`;
}

function sampleArt(): Plugin {
  const from = path.resolve(demoDir, "../content/comics/sample");
  return {
    name: "sample-comic-art",
    configureServer(server) {
      server.middlewares.use("/comics", (req, res, next) => {
        const name = path.basename((req.url || "").split("?")[0] || "");
        const file = path.join(from, name);
        if (!name || !file.startsWith(from) || !fs.existsSync(file)) {
          next();
          return;
        }
        res.setHeader("Content-Type", "image/jpeg");
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      const dest = path.resolve("dist/comics");
      if (!fs.existsSync(from)) return;
      fs.mkdirSync(dest, { recursive: true });
      for (const name of fs.readdirSync(from)) {
        if (name.endsWith(".jpg")) fs.copyFileSync(path.join(from, name), path.join(dest, name));
      }
    },
  };
}

function spaFallback(): Plugin {
  return {
    name: "github-pages-spa",
    closeBundle() {
      const dist = path.resolve("dist");
      const index = path.join(dist, "index.html");
      if (!fs.existsSync(index)) return;
      fs.copyFileSync(index, path.join(dist, "404.html"));
      fs.writeFileSync(path.join(dist, ".nojekyll"), "");
    },
  };
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react(), sampleArt(), spaFallback()],
});
