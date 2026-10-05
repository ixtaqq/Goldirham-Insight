const { readFileSync } = require("node:fs");
const { createRequire } = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

// Run the real server modules with isolated caches and mocked network boundaries.
module.exports = function loadTypeScript(entry, { fetch, env = {}, clock = Date, logger = { warn() {} } } = {}) {
  const modules = new Map();
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const nativeRequire = createRequire(filename);
    const localRequire = (specifier) => {
      if (specifier.startsWith("@/")) return load(path.join(root, specifier.slice(2) + ".ts"));
      if (specifier.startsWith(".")) return load(path.resolve(path.dirname(filename), specifier + ".ts"));
      return nativeRequire(specifier);
    };
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    });
    new Function("require", "module", "exports", "fetch", "process", "Date", "console", outputText)(
      localRequire, loadedModule, loadedModule.exports, fetch, { env }, clock, logger
    );
    return loadedModule.exports;
  }
  return load(path.join(root, entry));
};
