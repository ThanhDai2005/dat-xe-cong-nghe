const path = require("path");

const backendRoot = path.join(__dirname, "../..");
const envPath = path.join(__dirname, "../.env");

require("dotenv").config({
  path: envPath,
  quiet: true,
});

const resolveBackendPath = (value) => {
  if (!value) return null;
  return path.isAbsolute(value) ? value : path.join(backendRoot, value);
};

module.exports = {
  backendRoot,
  envPath,
  resolveBackendPath,
};
