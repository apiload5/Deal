#!/bin/bash

echo "🔧 Fixing React 19 and Next.js 16 issues..."

# 1. Update imports for React 19
echo "📝 Updating imports..."
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/import React from "react"/import * as React from "react"/g' {} +
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/import React, { /import { /g' {} +

# 2. Update package.json
echo "📦 Updating packages..."
npm install next@16.2.10 react@19.2.0 react-dom@19.2.0 --legacy-peer-deps
npm install --save-dev @types/react@19.0.1 @types/react-dom@19.0.2 --legacy-peer-deps
npm install next-auth@5.0.0-beta.25 @prisma/client@latest prisma@latest --legacy-peer-deps
npm install @ducanh2912/next-pwa@latest --legacy-peer-deps

# 3. Fix next.config
echo "⚙️ Fixing next.config to ESM..."
mv next.config.js next.config.mjs 2>/dev/null || true

# 4. Clean
echo "🧹 Cleaning..."
rm -rf .next node_modules package-lock.json

# 5. Fresh install
echo "📥 Fresh install..."
npm install --legacy-peer-deps

# 6. Prisma
echo "🗄️ Generating Prisma client..."
npx prisma format
npx prisma generate

# 7. Build
echo "🏗️ Building..."
npm run build

echo "✅ Done! Run 'npm run dev' to test"
