import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname, extname } from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const marker = new URL("./server-only.mjs", import.meta.url).href;
process.env.APP_URL = "https://malak.example";
// Test-only marker replacement allows injected server modules to run outside Next.
// No production entry imports this loader. No private environment file is loaded.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: marker, shortCircuit: true };
    if (["next/server", "next/headers", "next/navigation"].includes(specifier)) {
      return nextResolve(`${specifier}.js`, context);
    }
    let candidate;
    if (specifier.startsWith("@/")) candidate = resolve(root, "src", specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      candidate = resolve(dirname(fileURLToPath(context.parentURL)), specifier);
    }
    if (candidate && !extname(candidate)) {
      for (const suffix of [".ts", ".tsx", ".mjs"]) {
        if (existsSync(candidate + suffix)) return { url: pathToFileURL(candidate + suffix).href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith(".ts") || url.endsWith(".tsx")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { source, format: "module", shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

globalThis.fetch = async () => { throw new Error("Network requests are forbidden in offline auth tests."); };
