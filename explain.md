# دليل مشروع Angular لإدارة الحضانة

## 1. هيكل المشروع (Project Structure)

src/
│
├── app/
│ ├── core/ # الخدمات الأساسية (Auth, Guards, Interceptors, Models)
│ │ ├── services/
│ │ │ └── auth.service.ts
│ │ ├── guards/
│ │ │ └── auth.guard.ts
│ │ ├── interceptors/
│ │ │ └── jwt.interceptor.ts
│ │ └── models/
│ │ └── user.model.ts
│ │
│ ├── shared/ # مكونات قابلة لإعادة الاستخدام (Navbar, Directives, Pipes)
│ │ ├── components/
│ │ │ └── navbar.component.ts
│ │ ├── directives/
│ │ └── pipes/
│ │
│ ├── pages/ # صفحات كاملة حسب Modules (Auth, Home, Dashboard, Users, ...)
│ │ ├── auth/ # صفحات تسجيل الدخول، التسجيل، ونسيان كلمة المرور
│ │ │ ├── login/
│ │ │ ├── register/
│ │ │ ├── forget-password/
│ │ │ └── auth-routing.ts # Routing الخاص بصفحات Auth
│ │ ├── home/
│ │ ├── dashboard/
│ │ └── users/
│ │ ├── users-list.component.ts
│ │ └── user-edit.component.ts
│ │
│ ├── layout/ # Layout رئيسي (مثل MainLayoutComponent)
│ │ └── main-layout.component.ts
│ │
│ ├── app.component.ts # Root component
│ └── app.routes.ts # تجميع كل Routes في ملف واحد
│
├── assets/
└── environments/


---

## 2. تقسيم الروتينج (Routing)

- كل Module له ملف Routing مستقل، مثال:
  - `auth-routing.ts` لصفحات Auth (login, register, forget password).
  - كل ملف routing بيحتوي على مصفوفة Routes ويُصدّرها.

- في `app.routes.ts` بنستورد كل ملفات الروتينج دي ونستخدمها كـ children داخل المسار الأساسي مع Layout معين.

- مثال:

```ts
{
  path: 'auth',
  component: AuthLayoutComponent,
  children: authRoutes
}


3. Layouts و Components مشتركة
نعمل Layout رئيسي (MainLayoutComponent) يحتوي على:

Navbar

Sidebar

Footer (لو موجود)

Navbar, Sidebar, Footer يكونوا في مجلد shared/components ويُعاد استخدامها في Layout.

كل Modules مثل UserManagement, RoleManagement, KGManagement... هتستخدم نفس الـ MainLayout، بس مساراتها مختلفة وملفات Routing مستقلة.

4. كيفية التعامل مع Forms
نستخدم Reactive Forms لبناء فورمات تسجيل الدخول، التسجيل، وغيرها.

نستخدم FormBuilder داخل constructor أو ngOnInit حسب تعقيد الفورم.

Validators المستخدمة مثل: Validators.required, Validators.email, Validators.minLength, Validators.maxLength.

مثال على FormBuilder داخل constructor:

ts
Copy
Edit

constructor(private fb: FormBuilder) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]]
  });
}


5. التنقل بين الصفحات (Navigation)
نستخدم routerLink في القوالب (templates) للتنقل بين الصفحات.

تأكد أن كل الروابط صحيحة والمسارات معرفة في ملفات Routing.

مثال:

html
Copy
Edit

<a routerLink="/auth/login">Back to Login</a>

6. نصائح عامة
حافظ على تنظيم المشروع وتقسيمه لسهولة التوسعة والصيانة.

كل Module له مجلد خاص به يحتوي على:

Components

Routing

Services (لو احتاج)

استعمل خدمات Core للمهام العامة مثل المصادقة (Auth) وinterceptors.

Shared folder يحتوي على مكونات وأدوات قابلة لإعادة الاستخدام.

استعمل Layout components لفصل الهيكل العام عن المحتوى.
