const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('mockTests') || content.includes('mock-test')) {
        console.log(`Found reference in: ${filePath}`);
      }
    }
  });
}

searchDir('c:\\Users\\subas\\OneDrive\\Documents\\projects\\ielts\\frontend\\src');
