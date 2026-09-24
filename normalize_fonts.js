const fs = require('fs');
const path = require('path');

// Normalize font weights in all input/select/textarea className props
// Goal: inputs must use font-normal (regular), labels stay semibold via CSS

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // In className strings for input/textarea/select elements:
  // Replace font-medium with font-normal (inputs should be regular weight)
  // We do a targeted replacement: only when surrounded by other input-like classes
  
  // Pattern: inside a className that contains px-* py-* (typical input class)
  // and has font-medium, replace with font-normal
  content = content.replace(
    /(className="[^"]*?(?:px-[0-9.]+|py-[0-9.]+|rounded-xl|border border-slate)[^"]*?)\bfont-medium\b([^"]*?")/g,
    (match, before, after) => {
      // Only replace if the class looks like an input/select/textarea class
      if (before.includes('bg-slate') || before.includes('bg-white') || before.includes('placeholder')) {
        return before + 'font-normal' + after;
      }
      return match;
    }
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', path.basename(filePath));
  }
}

// Find all tsx files
function findTsx(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findTsx(full));
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

const files = findTsx(path.join(__dirname, 'src'));
files.forEach(processFile);
console.log('Done normalizing font weights in', files.length, 'files');
