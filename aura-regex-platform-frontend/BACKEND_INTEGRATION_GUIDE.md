# دليل ربط الـ Frontend بـ Backend

## 📋 نظرة عامة

هذا الـ Frontend متصل بالكامل بـ Backend الخاص بك الذي يستخدم:
- **PostgreSQL** قاعدة البيانات
- **Prisma** ORM
- **Gemini API** لتوليد regex بالذكاء الاصطناعي
- **Express.js** الخادم
- **JWT** المصادقة

---

## 🚀 خطوات التشغيل

### 1️⃣ تشغيل Backend أولاً

```bash
# انتقل إلى مجلد Backend
cd /path/to/backend

# ثبت المكتبات
npm install

# أنشئ ملف .env
cp .env.example .env

# حدّث .env بـ:
DATABASE_URL="postgresql://myuser:mypassword@localhost:5445/auraregex?schema=public"
GEMINI_API_KEY="AIzaSyDJRnBeVHCRRv6MTH3MSXzbt0eMf1M4vk8"
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET="BU_ALANA_COK_GIZLI_VE_UZUN_BIR_ANAHTAR_YAZIN"
FRONTEND_URL="http://localhost:3000"
PORT=8000

# شغّل الترحيلات
npx prisma migrate dev

# شغّل الخادم
npm run dev
```

**يجب أن ترى:**
```
✅ Database connected successfully.
🚀 Server is running at http://localhost:8000
```

---

### 2️⃣ تشغيل Frontend

```bash
# انتقل إلى مجلد Frontend
cd /path/to/aura-regex-platform-frontend

# ثبت المكتبات
pnpm install

# أنشئ ملف .env.local
cat > .env.local << EOF
VITE_API_URL="http://localhost:8000"
VITE_API_BASE_URL="http://localhost:8000/api"
VITE_GEMINI_API_KEY="AIzaSyDJRnBeVHCRRv6MTH3MSXzbt0eMf1M4vk8"
VITE_GEMINI_MODEL="gemini-2.5-flash"
EOF

# شغّل الخادم
pnpm dev
```

**ستظهر رسالة:**
```
Local: http://localhost:5173/
```

---

## 🔌 API Endpoints المتاحة

### المصادقة (Authentication)

```
POST   /api/auth/signup      - تسجيل حساب جديد
POST   /api/auth/login       - تسجيل الدخول
GET    /api/auth/profile     - الحصول على بيانات المستخدم
```

**مثال:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**الرد:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

### توليد Regex بالذكاء الاصطناعي

```
POST   /api/ai/regex         - توليد regex من وصف
GET    /api/ai/regex         - عرض جميع السجلات
GET    /api/ai/regex/search  - البحث في السجلات
PUT    /api/ai/regex/:id     - تحديث regex
DELETE /api/ai/regex/:id     - حذف regex
```

**مثال:**
```bash
curl -X POST http://localhost:8000/api/ai/regex \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"أريد regex لمطابقة عناوين البريد الإلكتروني"}'
```

**الرد:**
```json
{
  "success": true,
  "message": "✅ Regex başarıyla üretildi.",
  "regex": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
  "explanation": "هذا الـ regex يطابق عناوين البريد الإلكتروني...",
  "logId": 1
}
```

---

### إدارة القواعس (Rules)

```
POST   /api/rules            - إنشاء قاعدة جديدة
GET    /api/rules            - عرض جميع القواعس
GET    /api/rules/:id        - عرض قاعدة معينة
PUT    /api/rules/:id        - تحديث قاعدة
DELETE /api/rules/:id        - حذف قاعدة
POST   /api/rules/:id/like   - إضافة إعجاب
```

**مثال:**
```bash
curl -X POST http://localhost:8000/api/rules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email Pattern",
    "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    "flags": "g"
  }'
```

---

### إدارة المجلدات (Folders)

```
POST   /api/folders          - إنشاء مجلد جديد
GET    /api/folders          - عرض جميع المجلدات
GET    /api/folders/:id      - عرض مجلد معين
PUT    /api/folders/:id      - تحديث مجلد
DELETE /api/folders/:id      - حذف مجلد
```

---

### حالات الاختبار (Test Cases)

```
POST   /api/testcases        - إنشاء حالة اختبار
GET    /api/testcases        - عرض جميع الحالات
PUT    /api/testcases/:id    - تحديث حالة
DELETE /api/testcases/:id    - حذف حالة
```

---

### سجل التوليد (Generation Logs)

```
GET    /api/generationlogs   - عرض جميع السجلات
GET    /api/generationlogs/:id - عرض سجل معين
```

---

## 🔐 المصادقة (Authentication)

### كيفية الحصول على Token

1. **سجّل حساب جديد أو سجّل دخول:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **استخدم Token في الطلبات:**
```bash
curl -X GET http://localhost:8000/api/rules \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### في الـ Frontend

Token يُحفظ تلقائياً في `localStorage` عند تسجيل الدخول:
```javascript
localStorage.getItem('token')
```

---

## 📁 هيكل الملفات المهمة

```
aura-regex-platform-frontend/
├── client/src/
│   ├── lib/
│   │   └── api.ts              ← API service (جميع الـ endpoints)
│   ├── pages/
│   │   ├── Home.tsx            ← الصفحة الرئيسية
│   │   ├── Dashboard.tsx       ← لوحة التحكم (regex generation)
│   │   ├── RulesPage.tsx       ← إدارة القواعس
│   │   └── LogsPage.tsx        ← سجل التوليد
│   └── App.tsx                 ← التطبيق الرئيسي
├── .env.local                  ← متغيرات البيئة
└── BACKEND_INTEGRATION_GUIDE.md ← هذا الملف
```

---

## 🔧 متغيرات البيئة المطلوبة

### في Frontend (.env.local)

```
# Backend API
VITE_API_URL="http://localhost:8000"
VITE_API_BASE_URL="http://localhost:8000/api"

# Gemini API
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
VITE_GEMINI_MODEL="gemini-2.5-flash"
```

### في Backend (.env)

```
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5445/auraregex?schema=public"

# JWT
JWT_SECRET="YOUR_SECRET_KEY"
JWT_EXPIRATION="2h"

# Gemini
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_MODEL=gemini-2.5-flash

# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

---

## 🧪 اختبار الاتصال

### 1. تحقق من صحة Backend

```bash
curl http://localhost:8000/api/health
```

**الرد المتوقع:**
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2025-11-19T07:58:00.000Z"
}
```

### 2. اختبر التسجيل

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. اختبر توليد Regex

```bash
# أولاً سجّل دخول للحصول على token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# ثم استخدم Token لتوليد regex
curl -X POST http://localhost:8000/api/ai/regex \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"أريد regex لمطابقة الأرقام فقط"}'
```

---

## ⚠️ استكشاف الأخطاء الشائعة

### ❌ خطأ: "Cannot connect to Backend"

**السبب:** Backend غير مشغّل أو المنفذ خاطئ

**الحل:**
```bash
# تحقق من تشغيل Backend
curl http://localhost:8000/api/health

# إذا لم يعمل، شغّل Backend:
cd /path/to/backend
npm run dev
```

### ❌ خطأ: "CORS Error"

**السبب:** CORS غير مفعّل في Backend

**الحل:** تحقق من `index.ts` في Backend:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));
```

### ❌ خطأ: "Invalid Token"

**السبب:** Token منتهي الصلاحية أو خاطئ

**الحل:**
```bash
# سجّل دخول مرة أخرى للحصول على token جديد
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### ❌ خطأ: "Database Connection Failed"

**السبب:** PostgreSQL غير مشغّل أو DATABASE_URL خاطئة

**الحل:**
```bash
# تحقق من PostgreSQL
psql -U myuser -d auraregex -c "SELECT 1"

# إذا لم يعمل، شغّل PostgreSQL:
# على Linux/Mac:
brew services start postgresql

# على Windows:
# استخدم PostgreSQL installer
```

---

## 📊 تدفق البيانات

```
Frontend (React)
    ↓
API Service (axios)
    ↓
Backend (Express)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Gemini API (for AI generation)
```

---

## 🎯 الخطوات التالية

1. **اختبر جميع الصفحات:**
   - الصفحة الرئيسية (Home)
   - لوحة التحكم (Dashboard)
   - إدارة القواعس (Rules)
   - السجلات (Logs)

2. **تحقق من الميزات:**
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

1. تحقق من رسائل الخطأ في Console
2. تأكد من تشغيل Backend و PostgreSQL
3. تحقق من متغيرات البيئة
4. اطلب المساعدة مع رسالة الخطأ الكاملة

---

**استمتع بتطوير Aura Regex Platform! 🚀**
