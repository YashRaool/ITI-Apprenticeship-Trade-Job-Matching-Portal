const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT_DIR, "dist-eb");
const BUNDLE_DIR = path.join(OUT_DIR, "bundle");
const ZIP_FILE = path.join(OUT_DIR, "iti-job-portal-eb.zip");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

console.log("📦 Preparing Elastic Beanstalk deployment bundle...");

// 1. Verify build outputs exist
const serverDist = path.join(ROOT_DIR, "server", "dist");
const sharedDist = path.join(ROOT_DIR, "shared", "dist");

if (!fs.existsSync(serverDist) || !fs.existsSync(sharedDist)) {
  console.log("🔨 Pre-compiled dist missing. Building shared and server...");
  execSync("npm run build --workspace=shared && npm run build --workspace=server", {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });
}

// 2. Clean staging directory
if (fs.existsSync(BUNDLE_DIR)) fs.rmSync(BUNDLE_DIR, { recursive: true, force: true });
if (fs.existsSync(ZIP_FILE)) fs.rmSync(ZIP_FILE, { force: true });
ensureDir(BUNDLE_DIR);

// 3. Prepare tailored deployment root package.json (only server & shared workspaces)
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
const ebPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  private: true,
  workspaces: ["server", "shared"],
  scripts: {
    start: "node server/dist/index.js",
    postinstall: "npm run db:generate --workspace=server",
    "db:generate": "npm run db:generate --workspace=server",
    "db:deploy": "npm run db:deploy --workspace=server",
  },
};
fs.writeFileSync(path.join(BUNDLE_DIR, "package.json"), JSON.stringify(ebPkg, null, 2));

// 4. Copy lockfile and EB configs
if (fs.existsSync(path.join(ROOT_DIR, "package-lock.json"))) {
  fs.copyFileSync(path.join(ROOT_DIR, "package-lock.json"), path.join(BUNDLE_DIR, "package-lock.json"));
}
copyRecursive(path.join(ROOT_DIR, "Procfile"), path.join(BUNDLE_DIR, "Procfile"));
copyRecursive(path.join(ROOT_DIR, ".platform"), path.join(BUNDLE_DIR, ".platform"));
copyRecursive(path.join(ROOT_DIR, ".ebextensions"), path.join(BUNDLE_DIR, ".ebextensions"));

// 5. Copy shared workspace
copyRecursive(path.join(ROOT_DIR, "shared", "package.json"), path.join(BUNDLE_DIR, "shared", "package.json"));
copyRecursive(path.join(ROOT_DIR, "shared", "dist"), path.join(BUNDLE_DIR, "shared", "dist"));

// 6. Copy server workspace (dist, package.json, prisma schema & migrations)
copyRecursive(path.join(ROOT_DIR, "server", "package.json"), path.join(BUNDLE_DIR, "server", "package.json"));
copyRecursive(path.join(ROOT_DIR, "server", "dist"), path.join(BUNDLE_DIR, "server", "dist"));
copyRecursive(path.join(ROOT_DIR, "server", "prisma", "schema.prisma"), path.join(BUNDLE_DIR, "server", "prisma", "schema.prisma"));
copyRecursive(path.join(ROOT_DIR, "server", "prisma", "migrations"), path.join(BUNDLE_DIR, "server", "prisma", "migrations"));

console.log("✅ Staging files assembled at:", BUNDLE_DIR);

// 7. Create ZIP archive
try {
  if (process.platform === "win32") {
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${BUNDLE_DIR}/*' -DestinationPath '${ZIP_FILE}' -Force"`, {
      stdio: "inherit",
    });
  } else {
    execSync(`cd "${BUNDLE_DIR}" && zip -r "${ZIP_FILE}" .`, { stdio: "inherit" });
  }
  const sizeMb = (fs.statSync(ZIP_FILE).size / (1024 * 1024)).toFixed(2);
  console.log(`🎉 Elastic Beanstalk deployment zip ready: ${ZIP_FILE} (${sizeMb} MB)`);
} catch (err) {
  console.warn("⚠️ ZIP creation command failed. Bundle directory is still available at:", BUNDLE_DIR, err.message);
}
