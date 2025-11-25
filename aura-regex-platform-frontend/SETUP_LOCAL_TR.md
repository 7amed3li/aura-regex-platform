# 🚀 دليل التشغيل المحلي - Aura Regex Platform

## 📋 المتطلبات الأساسية

تأكد من تثبيت هذه البرامج على جهازك:

1. **Node.js** (الإصدار 18 أو أحدث)
   ```bash
   node --version  # يجب أن تظهر v18.0.0 أو أحدث
   ```

2. **npm أو pnpm**
   ```bash
   npm --version
   # أو
   pnpm --version
   ```

3. **PostgreSQL** (قاعدة البيانات)
   - [تحميل PostgreSQL](https://www.postgresql.org/download/)

4. **Git** (اختياري لـ clone المشروع)

---

## 🔧 خطوات التشغيل

### الخطوة 1️⃣: تحضير Backend

أولاً، شغّل Backend الخاص بك:

```bash
# انتقل إلى مجلد Backend
cd /path/to/your/backend

# ثبت المكتبات
npm install

# أنشئ ملف .env إذا لم يكن موجوداً
cp .env.example .env

# حدّث ملف .env بالقيم التالية:
```

**ملف .env للـ Backend:**
```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5445/auraregex?schema=public"

# JWT
JWT_SECRET="BU_ALANA_COK_GIZLI_VE_UZUN_BIR_ANAHTAR_YAZIN_gfd8g7d9fgd79"
JWT_EXPIRATION="2h"

# Gemini API
GEMINI_API_KEY="AIzaSyDJRnBeVHCRRv6MTH3MSXzbt0eMf1M4vk8"
GEMINI_MODEL="gemini-2.5-flash"

# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**شغّل الترحيلات وابدأ Backend:**
```bash
# شغّل ترحيلات Prisma
npx prisma migrate dev

# شغّل Backend
npm run dev
```

**يجب أن ترى:**
```
✅ Database connected successfully.
🚀 Server is running at http://localhost:8000
```

---

### الخطوة 2️⃣: تحضير Frontend

في نافذة Terminal جديدة:

```bash
# انتقل إلى مجلد Frontend
cd /path/to/aura-regex-platform-frontend

# ثبت المكتبات
pnpm install
# أو إذا كنت تستخدم npm:
npm install

# تحقق من ملف .env.local
cat .env.local
```

**ملف .env.local للـ Frontend:**
```env
# Backend API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api

# Gemini API
VITE_GEMINI_API_KEY=AIzaSyDJRnBeVHCRRv6MTH3MSXzbt0eMf1M4vk8
VITE_GEMINI_MODEL=gemini-2.5-flash

# Development
VITE_DEBUG=true
```

**شغّل Frontend:**
```bash
pnpm dev
# أو
npm run dev
```

**ستظهر رسالة:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

### الخطوة 3️⃣: افتح المتصفح

1. اذهب إلى: **http://localhost:5173**
2. يجب أن ترى الصفحة الرئيسية بالتركية
3. انقر على "Kontrol Panelinе Git" (الذهاب إلى لوحة التحكم)
4. سجّل دخول أو سجّل حساب جديد

---

## ✅ التحقق من الاتصال

### اختبر Backend:

```bash
# في Terminal جديد
curl http://localhost:8000/api/health
```

**الرد المتوقع:**
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2025-11-19T08:00:00.000Z"
}
```

### اختبر Frontend:

1. افتح **http://localhost:5173** في المتصفح
2. افتح **Developer Tools** (F12)
3. اذهب إلى **Console** tab
4. يجب أن ترى رسالة مثل:
   ```
   🔌 API Configuration: {
     API_BASE_URL: 'http://localhost:8000/api',
     API_URL: 'http://localhost:8000',
     NODE_ENV: 'development'
   }
   ```

---

## 🧪 اختبر الميزات

### 1. تسجيل الدخول

```bash
# سجّل دخول عبر الواجهة أو استخدم curl:
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. توليد Regex

```bash
# احصل على token أولاً
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# ثم وليّد regex
curl -X POST http://localhost:8000/api/ai/regex \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"أريد regex لمطابقة الأرقام فقط"}'
```

### 3. في الواجهة

1. اذهب إلى **Dashboard** (لوحة التحكم)
2. اكتب وصف: "أريد regex لمطابقة عناوين البريد الإلكتروني"
3. انقر **Regex Oluştur** (إنشاء Regex)
4. يجب أن ترى الـ regex المُولّد

---

## ⚠️ استكشاف الأخطاء الشائعة

### ❌ خطأ: "Backend sunucusu bağlanılamıyor"

**السبب:** Backend غير مشغّل

**الحل:**
```bash
# تأكد من تشغيل Backend
ps aux | grep "node"

# إذا لم يكن مشغّلاً، شغّله:
cd /path/to/backend
npm run dev
```

### ❌ خطأ: "Network Error"

**السبب:** المنفذ خاطئ أو CORS غير مفعّل

**الحل:**
```bash
# تحقق من أن Backend يعمل على المنفذ 8000
curl http://localhost:8000/api/health

# إذا لم يعمل، تحقق من .env:
PORT=8000
```

### ❌ خطأ: "Database connection failed"

**السبب:** PostgreSQL غير مشغّل أو DATABASE_URL خاطئة

**الحل:**
```bash
# تحقق من PostgreSQL
psql -U myuser -d auraregex -c "SELECT 1"

# إذا لم يعمل، شغّل PostgreSQL:
# على macOS:
brew services start postgresql

# على Linux:
sudo systemctl start postgresql

# على Windows:
# استخدم PostgreSQL installer
```

### ❌ خطأ: "Module not found"

**الحل:**
```bash
# أعد تثبيت المكتبات
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📁 هيكل المشروع

```
aura-regex-platform-frontend/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          ← الصفحة الرئيسية
│   │   │   ├── Dashboard.tsx     ← لوحة التحكم
│   │   │   ├── RulesPage.tsx     ← إدارة القواعس
│   │   │   └── LogsPage.tsx      ← السجلات
│   │   ├── lib/
│   │   │   └── api.ts            ← API service
│   │   └── App.tsx               ← التطبيق الرئيسي
│   └── index.html
├── server/
│   └── routers.ts                ← tRPC routers
├── .env.local                    ← متغيرات البيئة
└── package.json
```

---

## 🔐 متغيرات البيئة المهمة

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `VITE_API_URL` | `http://localhost:8000` | عنوان Backend |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | عنوان API |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | مفتاح Gemini API |
| `VITE_GEMINI_MODEL` | `gemini-2.5-flash` | نموذج Gemini |

---

## 🎯 الخطوات التالية

بعد التشغيل الناجح:

1. **اختبر جميع الصفحات:**
   - Home (الصفحة الرئيسية)
   - Dashboard (لوحة التحكم)
   - Rules (إدارة القواعس)
   - Logs (السجلات)

2. **اختبر الميزات:**
   - ✅ تسجيل الدخول والتسجيل
   - ✅ توليد regex من الوصف
   - ✅ اختبار regex
   - ✅ حفظ القواعس
   - ✅ عرض السجلات

3. **أضف ميزات جديدة:**
   - البحث المتقدم
   - مشاركة القواعس
   - التصدير والاستيراد

---

## 📞 الدعم والمساعدة

إذا واجهت مشاكل:

1. **تحقق من رسائل الخطأ في Console (F12)**
2. **تأكد من تشغيل Backend و PostgreSQL**
3. **تحقق من متغيرات البيئة في .env و .env.local**
4. **اطلب المساعدة مع رسالة الخطأ الكاملة**

---

## 🚀 نصائح مفيدة

### تشغيل كلا المشروعين معاً

```bash
# نافذة Terminal 1: Backend
cd /path/to/backend
npm run dev

# نافذة Terminal 2: Frontend
cd /path/to/frontend
pnpm dev

# نافذة Terminal 3: PostgreSQL (إذا لزم الأمر)
psql -U myuser -d auraregex
```

### مسح الـ Cache

```bash
# إذا واجهت مشاكل غريبة:
rm -rf .vite node_modules/.vite
pnpm dev
```

### تفعيل Debug Mode

```bash
# في .env.local
VITE_DEBUG=true

# ثم في Console:
localStorage.setItem('debug', 'true')
```

---

**استمتع بتطوير Aura Regex Platform! 🎉**

للمزيد من المعلومات، اطلع على:
- `BACKEND_INTEGRATION_GUIDE.md` - دليل التكامل
- `README.md` - ملف التعريف العام
