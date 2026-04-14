const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🎨 Building Tailwind CSS...\n");

try {
  // Build with Tailwind CLI
  const command =
    "npx tailwindcss -i ./public/css/input.css -o ./public/css/tailwind.min.css --minify";

  console.log("⚙️  Running Tailwind compilation...");
  execSync(command, { stdio: "inherit" });

  // Get file size
  const outputPath = path.join(__dirname, "../public/css/tailwind.min.css");
  const stats = fs.statSync(outputPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);

  console.log("\n✅ Build complete!");
  console.log(`📦 Output: public/css/tailwind.min.css`);
  console.log(`📊 Size: ${fileSizeInKB} KB`);
  console.log('\n💡 Tip: Run "npm run watch:css" for development mode\n');
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
