// Batch update script to replace CDN links in all HTML files
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../public");

// Files to update
const htmlFiles = [
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

// Replacements to make
const replacements = [
  {
    name: "Tailwind CDN",
    find: /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g,
    replace:
      '<link rel="stylesheet" href="/css/tailwind.min.css">\n    <link rel="stylesheet" href="/css/skeleton.css">',
  },
  {
    name: "Lucide defer",
    find: /<script src="https:\/\/unpkg\.com\/lucide@latest"><\/script>/g,
    replace:
      '<script src="https://unpkg.com/lucide@latest" defer></script>\n    \n    <!-- Service Worker Registration -->\n    <script src="/js/sw-register.js" defer></script>\n    \n    <!-- Offline Indicator -->\n    <script src="/js/offline-indicator.js" defer></script>',
  },
  {
    name: "Font optimization",
    find: /(<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit:wght=300;400;600;700&display=swap" rel="stylesheet">)/g,
    replace:
      '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this.media=\'all\'">',
  },
];

console.log("🔄 Updating HTML files to use local assets...\n");

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

    replacements.forEach(({ name, find, replace }) => {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changesMade = true;
      }
    });

    if (changesMade) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated: ${filename}`);
      updatedCount++;
    } else {
      console.log(`⏭️  Skipped: ${filename} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updatedCount} files`);
console.log(`   Errors: ${errorCount} files`);
console.log(`\n✨ Done!`);
