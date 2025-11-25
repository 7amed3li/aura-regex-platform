# دليل تشغيل منصة Aura Regex محلياً

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

1. **Node.js** (الإصدار 18 أو أحدث)
   - تحميل من: https://nodejs.org/
   - التحقق: `node -v`

2. **npm أو pnpm**
   - npm يأتي مع Node.js
   - أو ثبت pnpm: `npm install -g pnpm`

3. **Git** (لتنزيل المشروع)
   - تحميل من: https://git-scm.com/

4. **قاعدة بيانات MySQL**
   - محلياً: ثبت MySQL Server
   - أو سحابياً: استخدم خدمة مثل PlanetScale أو AWS RDS

---

## الخطوة 1: تنزيل المشروع

```bash
# انسخ المشروع
git clone <رابط-المشروع>
cd aura-regex-platform-frontend

# أو إذا كان لديك الملفات مباشرة
cd /path/to/aura-regex-platform-frontend
```

---

## الخطوة 2: تثبيت المكتبات

```bash
# استخدم pnpm (مفضل)
pnpm install

# أو استخدم npm
npm install
```

---

## الخطوة 3: إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```bash
# قاعدة البيانات
DATABASE_URL="mysql://username:password@localhost:3306/aura_regex"

# المفاتيح السرية
JWT_SECRET="your-secret-key-here-change-this"

# OAuth (Manus)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"

# معلومات المالك
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your-open-id"

# عنوان التطبيق والشعار
VITE_APP_TITLE="Aura Regex Platform"
VITE_APP_LOGO="/logo.svg"

# APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-key"
```

---

## الخطوة 4: إعداد قاعدة البيانات

### إذا كنت تستخدم MySQL محلياً:

```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE aura_regex;
USE aura_regex;

# خروج
exit
```

### ثم قم بتشغيل الترحيلات:

```bash
# دفع التغييرات إلى قاعدة البيانات
pnpm db:push

# أو إذا كنت تستخدم npm
npm run db:push
```

---

## الخطوة 5: تشغيل المشروع

### في وضع التطوير:

```bash
# استخدم pnpm
pnpm dev

# أو استخدم npm
npm run dev
```

سيظهر شيء مثل:
```
VITE v7.1.9  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### افتح المتصفح:

اذهب إلى: `http://localhost:5173`

---

## الخطوة 6: تسجيل الدخول

1. انقر على زر "Giriş Yap" (تسجيل الدخول)
2. ستُعاد إلى صفحة تسجيل الدخول في Manus
3. بعد التسجيل، ستُعاد إلى لوحة التحكم

---

## الأوامر المهمة

```bash
# تشغيل المشروع في وضع التطوير
pnpm dev

# بناء المشروع للإنتاج
pnpm build

# تشغيل الاختبارات
pnpm test

# تشغيل linter
pnpm lint

# دفع تغييرات قاعدة البيانات
pnpm db:push

# عرض واجهة قاعدة البيانات
pnpm db:studio
```

---

## هيكل المشروع

```
aura-regex-platform-frontend/
├── client/                 # الواجهة الأمامية (React)
│   ├── src/
│   │   ├── pages/         # الصفحات الرئيسية
│   │   ├── components/    # المكونات المعاد استخدامها
│   │   ├── lib/           # المكتبات المساعدة
│   │   └── App.tsx        # التطبيق الرئيسي
│   └── index.html         # HTML الرئيسي
├── server/                 # الخادم (Express + tRPC)
│   ├── routers.ts         # تعريفات tRPC
│   ├── db.ts              # استعلامات قاعدة البيانات
│   └── _core/             # الملفات الأساسية
├── drizzle/               # قاعدة البيانات
│   ├── schema.ts          # تعريف الجداول
│   └── migrations/        # الترحيلات
└── package.json           # المكتبات والأوامر
```

---

## استكشاف الأخطاء

### خطأ: "Cannot find module"
```bash
# حل: أعد تثبيت المكتبات
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### خطأ: "Database connection failed"
```bash
# تحقق من:
1. MySQL يعمل: mysql -u root -p
2. DATABASE_URL صحيحة في .env.local
3. قاعدة البيانات موجودة: CREATE DATABASE aura_regex;
```

### خطأ: "Port 5173 is already in use"
```bash
# استخدم منفذ مختلف
pnpm dev -- --port 3000
```

---

## الميزات المتاحة

✅ **الصفحة الرئيسية** - معلومات عن المنصة وتسجيل الدخول
✅ **لوحة التحكم** - إنشاء واختبار regex
✅ **إدارة القواعس** - حفظ وتعديل الأنماط
✅ **سجل الإنشاء** - عرض التاريخ
✅ **المصادقة** - تسجيل الدخول الآمن

---

## الدعم والمساعدة

إذا واجهت مشاكل:

1. تحقق من رسائل الخطأ في Terminal
2. تأكد من جميع المتطلبات مثبتة
3. أعد تشغيل الخادم: `Ctrl+C` ثم `pnpm dev`

---

**استمتع بتطوير Aura Regex Platform! 🚀**
