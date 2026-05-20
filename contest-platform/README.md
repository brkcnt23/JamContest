# Online Game Jam Platform

Game jam yarışmaları düzenlemek, katılmak ve değerlendirmek için full-stack web platformu.

## Tech Stack

- **Backend:** NestJS + Prisma ORM + PostgreSQL
- **Frontend:** Vue 3 (Composition API) + Vite + TypeScript
- **Auth:** JWT tabanlı kimlik doğrulama
- **i18n:** Türkçe & İngilizce tam destek

## Özellikler

### Kullanıcı Rolleri
- **Super Admin** — Platform yönetimi
- **Admin** — İçerik ve kullanıcı yönetimi
- **Organizer** — Yarışma oluşturma ve yönetme
- **Jury** — Başvuruları değerlendirme ve puanlama
- **Company** — İş ilanı yayınlama, başvuru yönetimi
- **User** — Yarışmalara katılma, proje gönderme

### Yarışma (Contest)
- Çok aşamalı durum akışı (taslak → başvuru → aktif → değerlendirme → sonuç)
- Manuel veya otomatik onay modu
- Eş-organizatör ve jüri atama

### Sosyal
- Gönderi oluşturma, beğeni/yorum
- Rozet sistemi (Early Adopter, First Win, Top 3, Pro, vb.)

### Projeler & İşler
- Proje oluşturma, takım arkadaşı arama, mesajlaşma
- İş ilanı yayınlama, özel sorularla başvuru toplama

### Monetization
- Abonelik katmanları (Free → Creator → Pro → Recruiter)
- Stripe entegrasyonu
- Ödeme geçmişi ve fatura yönetimi

## Kurulum

```bash
cd backend   && npm install && npx prisma migrate dev && npx prisma db seed
cd frontend  && npm install && npm run dev
```

Backend: `http://localhost:8000` | Frontend: `http://localhost:5173`
