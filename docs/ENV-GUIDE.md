# .env Yapılandırma Rehberi

## Yapman gerekenler

### 1. Yeni JWT_SECRET oluştur
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Çıktıyı kopyala.

### 2. Production .env dosyasını güncelle

**Dosya:** `contest-platform/backend/.env`

```
DATABASE_URL="postgresql://burakcan_contest_db:YENI-SIFRE@185.72.9.232:5432/..."
JWT_SECRET="yukaridaki-cikti"
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://jamcontest.com
MAIL_HOST=mail.jamcontest.com
MAIL_PORT=587
MAIL_USER=noreply@jamcontest.com
MAIL_PASS="yeni-mail-sifresi"
UPLOAD_PATH=./uploads
```

### 3. PostgreSQL şifresini değiştir (varsa)
```sql
ALTER USER burakcan_contest_db PASSWORD 'yeni-guclu-sifre';
```

### 4. Claude'a .env okuma izni verme
`.claude/settings.local.json` içinde `Read(**/.env)` varsa sil. `Read(**/.env.example)` bırakabilirsin.

### 5. Kontrol listesi
- [ ] `.env` commit'lenmiş olmasın (gitignore'da olmalı)
- [ ] `.env.local` sadece local geliştirme için
- [ ] Production JWT_SECRET ≠ local JWT_SECRET
- [ ] Production DB şifresi ≠ local DB şifresi
- [ ] Mail şifresi güncel

### 6. Claude'a bu işlemlerden sonra haber ver
Docker testi ve diğer işleri kaldığımız yerden devam ederiz.
