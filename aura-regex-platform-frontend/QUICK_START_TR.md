# البدء السريع - تشغيل المشروع محلياً

## 🚀 الخطوات السريعة (5 دقائق)

### 1️⃣ تثبيت المتطلبات

```bash
# تحقق من Node.js
node -v
npm -v

# إذا لم يكن مثبتاً، حمله من: https://nodejs.org/
```

### 2️⃣ تنزيل المشروع

```bash
# انسخ المشروع من GitHub أو استخدم الملفات المحلية
cd aura-regex-platform-frontend
```

### 3️⃣ تثبيت المكتبات

```bash
npm install
# أو
pnpm install
```

### 4️⃣ إعداد قاعدة البيانات

**أ) إنشاء ملف `.env.local`:**

```
DATABASE_URL="mysql://root:password@localhost:3306/aura_regex"
JWT_SECRET="your-secret-key"
VITE_APP_TITLE="Aura Regex Platform"
```

**ب) إنشاء قاعدة البيانات:**

```bash
# افتح MySQL
mysql -u root -p

# في MySQL
CREATE DATABASE aura_regex;
exit

# ثم قم بتشغيل الترحيلات
npm run db:push
```

### 5️⃣ تشغيل المشروع

```bash
npm run dev
```

ستظهر رسالة:
```
Local: http://localhost:5173/
```

افتح المتصفح واذهب إلى: **http://localhost:5173**

---

## 📱 الصفحات المتاحة

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | معلومات وتسجيل دخول |
| لوحة التحكم | `/dashboard` | إنشاء واختبار regex |
| القواعس | `/rules` | إدارة الأنماط المحفوظة |
| السجلات | `/logs` | عرض التاريخ |

---

## 🔧 أوامر مهمة

```bash
# تشغيل المشروع
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الاختبارات
npm run test

# عرض قاعدة البيانات
npm run db:studio
```

---

## ⚠️ حل المشاكل الشائعة

### ❌ خطأ: "Port 5173 already in use"
```bash
npm run dev -- --port 3000
```

### ❌ خطأ: "Database connection failed"
```bash
# تأكد من:
1. MySQL يعمل
2. DATABASE_URL صحيحة
3. قاعدة البيانات موجودة
```

### ❌ خطأ: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

---

## 📚 الملفات المهمة

```
📁 client/src/
  ├── pages/
  │   ├── Home.tsx          # الصفحة الرئيسية
  │   ├── Dashboard.tsx     # لوحة التحكم
  │   ├── RulesPage.tsx     # إدارة القواعس
  │   └── LogsPage.tsx      # السجلات
  ├── App.tsx               # التطبيق الرئيسي
  └── lib/trpc.ts           # اتصال tRPC

📁 server/
  ├── routers.ts            # API endpoints
  ├── db.ts                 # استعلامات قاعدة البيانات
  └── _core/                # ملفات أساسية

📁 drizzle/
  └── schema.ts             # تعريف جداول قاعدة البيانات
```

---

## 🎯 الخطوة التالية

بعد التشغيل الناجح:

1. **سجل دخول** باستخدام حسابك
2. **اذهب إلى لوحة التحكم** وابدأ بإنشاء regex
3. **اختبر الأنماط** مع نصوص مختلفة
4. **احفظ القواعس** المفضلة لديك

---

**هل تحتاج مساعدة؟** اطلب المزيد من التفاصيل! 🆘
