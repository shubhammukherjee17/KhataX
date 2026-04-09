const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace .toFixed(2) with .toLocaleString('en-IN', { maximumFractionDigits: 2 })
  // We need to be careful with things like .toFixed(2) - usually called on numbers.
  // RegExp: \.toFixed\(2\)
  content = content.replace(/\.toFixed\(2\)/g, ".toLocaleString('en-IN', { maximumFractionDigits: 2 })");

  // 2. Replace { minimumFractionDigits: 2, maximumFractionDigits: 2 } or 
  // { minimumFractionDigits: 2 } directly.
  content = content.replace(/minimumFractionDigits:\s*2/g, "minimumFractionDigits: 0");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      processFile(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, 'app'));
traverseDir(path.join(__dirname, 'components'));
console.log('Done!');
