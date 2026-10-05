const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { getRootDirs } = require("@next/eslint-plugin-next/dist/utils/get-root-dirs");

const root = path.resolve(__dirname, "..");
const normalizedRoot = root.replace(/\\/g, "/");

function roots(rootDir) {
  return getRootDirs({ cwd: root, settings: { next: { rootDir } } }).sort();
}

test("Next lint uses the current project when rootDir is not configured", () => {
  assert.deepEqual(roots(undefined), [root]);
});

test("Next lint resolves directory globs, brace patterns and Windows separators", () => {
  const expected = ["app", "components"].map((dir) => `${normalizedRoot}/${dir}`).sort();
  assert.deepEqual(roots(`${normalizedRoot}/{app,components}`), expected);
  assert.deepEqual(roots(`${normalizedRoot}/componen*`), [`${normalizedRoot}/components`]);
  assert.deepEqual(roots(`${normalizedRoot}\\app`), [`${normalizedRoot}/app`]);
  assert.deepEqual(roots("{app,components}"), ["app", "components"]);
});

test("Next lint accepts multiple roots and excludes files and missing directories", () => {
  assert.deepEqual(roots([
    `${normalizedRoot}/app`,
    `${normalizedRoot}/components`,
    `${normalizedRoot}/package.json`,
    `${normalizedRoot}/directory-that-does-not-exist`,
  ]), ["app", "components"].map((dir) => `${normalizedRoot}/${dir}`).sort());
});
