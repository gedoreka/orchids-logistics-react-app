#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting build process..."

# 1. Run Next.js build
npm run build

# 2. Prepare the deployment folder
echo "📦 Preparing deployment package..."
rm -rf deploy_package
mkdir -p deploy_package

# 3. Copy standalone output
cp -r .next/standalone/* deploy_package/
cp -r .next/standalone/.next deploy_package/ 2>/dev/null || true

# 4. Copy public folder (Next.js doesn't include this in standalone by default)
cp -r public deploy_package/

# 5. Copy static files (Next.js doesn't include this in standalone by default)
mkdir -p deploy_package/.next/static
cp -r .next/static/* deploy_package/.next/static/

# 6. Create the ZIP file
echo "🗜️ Creating ZIP file..."
cd deploy_package
zip -r ../deploy.zip .
cd ..

echo "✅ Success! Your deployment file is ready: deploy.zip"
echo "Follow the instructions to upload this to Hostinger."
