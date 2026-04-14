// Rollback script - restore CDN links in all HTML files
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");

// Files to rollback
const htmlFiles = [
  "index.html",
  "menu.html",
  "anime.html",
  "detail.html",
  "watch.html",
  "admin.html",
  "login.html",
  "register.html",
  "profile.html",
  "achievements.html",
  "setting.html",
  "toast-demo.html",
];

// Rollback replacements
const rollbacks = [
  {
    name: "Restore Tailwind CDN",
    find: /<link rel="stylesheet" href="\/css\/tailwind\.min\.css">\s*<link rel="stylesheet" href="\/css\/skeleton\.css">/g,
    replace: '<script src="https://cdn.tailwindcss.com"></script>',
  },
  {
    name: "Remove service worker",
    find: /\s*<!-- Service Worker Registration -->\s*<script src="\/js\/sw-register\.js" defer><\/script>\s*\s*<!-- Offline Indicator -->\s*<script src="\/js\/offline-indicator\.js" defer><\/script>/g,
    replace: "",
  },
  {
    name: "Restore Lucide without defer",
    find: /<script src="https:\/\/unpkg\.com\/lucide@latest" defer><\/script>/g,
    replace: '<script src="https://unpkg.com/lucide@latest"></script>',
  },
  {
    name: "Restore font loading",
    find: /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this\.media='all'">/g,
    replace:
      '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">',
  },
];

console.log("🔄 Rolling back to CDN assets...\n");

let updatedCount = 0;
let errorCount = 0;

htmlFiles.forEach((filename) => {
  const filePath = path.join(publicDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${filename} (not found)`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, "utf8");
    let changesMade = false;

    rollbacks.forEach(({ name, find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changesMade = true;
      }
    });

    if (changesMade) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Rolled back: ${filename}`);
      updatedCount++;
    } else {
      console.log(`⏭️  Skipped: ${filename} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error rolling back ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Rolled back: ${updatedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`\n✨ Done! Website restored to CDN mode.`);
