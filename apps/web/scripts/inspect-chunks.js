const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const chunksDir = path.join(__dirname, '..', '.next', 'static', 'chunks');
const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));

console.log(`Found ${files.length} chunk files in ${chunksDir}\n`);

const chunkDetails = files.map(file => {
  const filePath = path.join(chunksDir, file);
  const content = fs.readFileSync(filePath);
  const uncompressedSize = content.length;
  const gzippedSize = zlib.gzipSync(content).length;
  const brotliSize = zlib.brotliCompressSync(content).length;

  // Search for package signatures in chunk
  const contentStr = content.toString('utf8').slice(0, 10000) + content.toString('utf8').slice(-10000);
  let identity = 'unknown';
  if (contentStr.includes('pdf-lib') || contentStr.includes('PDFDocument') || contentStr.includes('fontkit')) identity = 'pdf-lib';
  else if (contentStr.includes('framer-motion') || contentStr.includes('MotionValue')) identity = 'framer-motion';
  else if (contentStr.includes('lucide-react')) identity = 'lucide-react';
  else if (contentStr.includes('react-hook-form') || contentStr.includes('useForm')) identity = 'react-hook-form';
  else if (contentStr.includes('zod')) identity = 'zod';
  else if (contentStr.includes('react-dom') || contentStr.includes('hydrateRoot')) identity = 'react-dom';
  else if (contentStr.includes('turbopack')) identity = 'turbopack runtime';
  else if (contentStr.includes('@tanstack/react-query')) identity = 'react-query';
  else if (contentStr.includes('supabase')) identity = 'supabase';

  return {
    file,
    uncompressedSize,
    gzippedSize,
    brotliSize,
    identity
  };
});

chunkDetails.sort((a, b) => b.gzippedSize - a.gzippedSize);

console.log('Top chunks sorted by GZIP size:');
console.log('-------------------------------------------------------------------------------------');
console.log('File'.padEnd(30) + ' | Uncompressed'.padEnd(16) + ' | Gzip'.padEnd(12) + ' | Brotli'.padEnd(12) + ' | Inferred Library');
console.log('-------------------------------------------------------------------------------------');
let totalGzip = 0;
let totalBrotli = 0;
chunkDetails.forEach(c => {
  totalGzip += c.gzippedSize;
  totalBrotli += c.brotliSize;
  console.log(
    `${c.file.padEnd(30)} | ${(c.uncompressedSize / 1024).toFixed(1).padEnd(10)} KB | ${(c.gzippedSize / 1024).toFixed(1).padEnd(6)} KB | ${(c.brotliSize / 1024).toFixed(1).padEnd(6)} KB | ${c.identity}`
  );
});
console.log('-------------------------------------------------------------------------------------');
console.log(`ALL static chunks total: Gzip = ${(totalGzip / 1024).toFixed(1)} KB | Brotli = ${(totalBrotli / 1024).toFixed(1)} KB`);
