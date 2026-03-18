#!/bin/bash

# DEP Campus Platform - Initial Setup Script
# This script sets up the v4 implementation

set -e

echo "🏗️  DEP Campus Platform - v4 Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ first."
  exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm first."
  exit 1
fi

echo "✅ npm $(npm --version) found"
echo ""

# Create directories
echo "📁 Creating directory structure..."
mkdir -p src/{app,components,lib,contexts}
mkdir -p public/icons
mkdir -p db/migrations
echo "✅ Directories created"

echo ""
echo "📦 Installing dependencies..."
echo "This will take a few minutes..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local"
echo "   cp .env.example .env.local"
echo ""
echo "2. Add your Supabase credentials to .env.local"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "3. Create database schema (run this in Supabase dashboard):"
echo "   See db/migrations/001_initial_schema.sql"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. Visit http://localhost:3000"
echo ""
echo "Happy building! 🚀"
