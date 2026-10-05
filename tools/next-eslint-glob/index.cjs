const path = require("node:path");
const { globSync } = require("tinyglobby");

exports.globSync = (pattern, options) => globSync(pattern, {
  ...options,
  expandDirectories: false,
  absolute: path.isAbsolute(pattern),
}).map((entry) => entry.length > path.parse(entry).root.length ? entry.replace(/\/$/, "") : entry);
