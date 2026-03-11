import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix double dark classes
content = content.replace(/dark:text-gray-500 dark:text-gray-400/g, 'dark:text-gray-500');
content = content.replace(/dark:bg-gray-700 dark:hover:bg-gray-700/g, 'dark:hover:bg-gray-700');
content = content.replace(/dark:bg-gray-800 dark:bg-gray-800/g, 'dark:bg-gray-800');
content = content.replace(/dark:bg-gray-900 dark:bg-gray-900\/50/g, 'dark:bg-gray-900/50');

fs.writeFileSync(file, content);
console.log('Done');
