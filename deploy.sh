#!/bin/bash

# 🚀 GitHub Pages Deployment Script
# Bu script projeyi GitHub Pages'e deploy etmenizi kolaylaştırır

echo "🤖 Kodlama Arkadaşı - GitHub Pages Deploy"
echo "========================================"

# Dosya kontrolü
echo "📁 Dosyalar kontrol ediliyor..."
if [ ! -f "index.html" ]; then
    echo "❌ index.html bulunamadı!"
    exit 1
fi

if [ ! -f "style.css" ]; then
    echo "❌ style.css bulunamadı!"
    exit 1
fi

if [ ! -f "script.js" ]; then
    echo "❌ script.js bulunamadı!"
    exit 1
fi

echo "✅ Tüm dosyalar mevcut!"
echo ""

echo "📋 GITHUB PAGES DEPLOY ADIMLAR:"
echo ""
echo "1. 🌐 GitHub.com'a git"
echo "2. ➕ Yeni repository oluştur: 'kodlama-arkadasim'"
echo "3. 📤 Bu dosyaları repoya yükle:"
echo "   - index.html"
echo "   - style.css" 
echo "   - script.js"
echo "   - manifest.json"
echo "   - README.md"
echo ""
echo "4. ⚙️  Repository Settings > Pages"
echo "5. 🔗 Source: Deploy from a branch"
echo "6. 📂 Branch: main / root"
echo "7. 💾 Save"
echo ""
echo "🎉 SONUÇ:"
echo "https://[kullaniciadi].github.io/kodlama-arkadasim"
echo ""
echo "📱 Bu URL mobilde HTTPS ile çalışacak!"
echo "🎤 Speech API sorunsuz çalışır!"

# Git komutları önerisi
echo ""
echo "🔧 GIT KOMUTLARI (opsiyonel):"
echo "git init"
echo "git add ."
echo "git commit -m 'İlk commit: Kodlama Arkadaşı'"
echo "git branch -M main" 
echo "git remote add origin https://github.com/[kullaniciadi]/kodlama-arkadasim.git"
echo "git push -u origin main"
