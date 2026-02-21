# Teknofest 2025 - 42 Türkiye Algorithm Game

Bu proje, Teknofest Istanbul 2025 için tasarlanan algoritma oyununu React + TypeScript + Vite + Electron mimarisiyle yeniden yapılandırır.

## Teknolojiler

- React + TypeScript
- Vite
- Vitest + Testing Library
- Electron + electron-builder (Windows NSIS)

## Komutlar

- `npm install`
- `npm run dev` web geliştirme
- `npm run build` production web build
- `npm run preview` build önizleme
- `npm run test` testleri çalıştır
- `npm run lint` lint kontrolü
- `npm run desktop:dev` Electron geliştirme
- `npm run desktop:build` Windows kurulum paketi üretimi

> Not: Linux ortamında Windows NSIS paketlemek için `wine` gereklidir.

## Veri Kaynağı

Seviyeler `public/data/levels.json` dosyasından yüklenir.

Desteklenen ek opsiyonel alanlar:

- `uiHint?: string`
- `parMoves?: number`
- `tags?: string[]`

## Legacy

Eski statik sürüm referans amacıyla `legacy/` klasörüne taşınmıştır.
