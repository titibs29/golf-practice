import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  ['bg-white', 'bg-white dark:bg-gray-900'],
  ['border-black/5', 'border-black/5 dark:border-white/10'],
  ['text-gray-400', 'text-gray-400 dark:text-gray-500'],
  ['text-gray-500', 'text-gray-500 dark:text-gray-400'],
  ['text-gray-600', 'text-gray-600 dark:text-gray-300'],
  ['bg-gray-50', 'bg-gray-50 dark:bg-gray-800'],
  ['bg-gray-100', 'bg-gray-100 dark:bg-gray-800'],
  ['bg-emerald-50', 'bg-emerald-50 dark:bg-emerald-900/30'],
  ['border-emerald-100', 'border-emerald-100 dark:border-emerald-800'],
  ['text-emerald-600', 'text-emerald-600 dark:text-emerald-400'],
  ['bg-emerald-100', 'bg-emerald-100 dark:bg-emerald-900/30'],
  ['text-emerald-700', 'text-emerald-700 dark:text-emerald-400'],
  ['bg-rose-50', 'bg-rose-50 dark:bg-rose-900/30'],
  ['border-rose-100', 'border-rose-100 dark:border-rose-800'],
  ['text-rose-700', 'text-rose-700 dark:text-rose-400'],
  ['bg-rose-100', 'bg-rose-100 dark:bg-rose-900/30'],
  ['text-rose-500', 'text-rose-500 dark:text-rose-400'],
  ['border-gray-200', 'border-gray-200 dark:border-gray-700'],
  ['border-gray-100', 'border-gray-100 dark:border-gray-800'],
  ['text-gray-900', 'text-gray-900 dark:text-white'],
  ['text-gray-800', 'text-gray-800 dark:text-gray-200'],
  ['bg-gray-200', 'bg-gray-200 dark:bg-gray-700'],
  ['bg-white/50', 'bg-white/50 dark:bg-gray-900/50']
];

// Avoid double replacing
replacements.forEach(([search, replace]) => {
  content = content.split(search).join(replace);
});

// Clean up double replacements if any
replacements.forEach(([search, replace]) => {
  const doubleReplace = replace + ' ' + replace.replace(search, '').trim();
  content = content.split(doubleReplace).join(replace);
});

fs.writeFileSync(file, content);
console.log('Done');
