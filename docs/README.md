# Go Absen - Enterprise Architecture Documentation

## Overview

Go Absen adalah sistem absensi karyawan modern yang dibangun dengan arsitektur enterprise yang scalable dan maintainable. Proyek ini menggunakan Next.js 15, React 19, TypeScript, dan Tailwind CSS dengan design system yang konsisten.

## 🏗️ Arsitektur

### Phase 1: Fondasi Sistem
- ✅ **Theme System**: Konfigurasi tema yang komprehensif dengan dark mode
- ✅ **Shadcn Components**: Komponen UI yang lengkap dan reusable
- ✅ **Layout Structure**: Header, Sidebar, Footer, Navigation, dan Toaster
- ✅ **Error Boundaries**: Penanganan error yang robust dengan fallback UI
- ✅ **Skeleton Loading**: Loading states yang konsisten

### Phase 2: Bisnis & Integrasi
- ✅ **DataTable**: Komponen tabel yang reusable dengan sorting, filtering, dan pagination
- ✅ **Form Patterns**: Form components dengan validasi Zod yang terintegrasi
- ✅ **Global Store**: State management dengan Zustand (authStore, uiStore, notificationStore)
- ✅ **Mobile & Responsive**: Komponen yang responsive dan mobile-first

### Phase 3: Optimasi & Dokumentasi
- ✅ **Data Visualization**: Chart components yang flexible
- ✅ **Performance**: Lazy loading, caching, dan code splitting
- ✅ **Testing**: Setup unit testing dan e2e testing
- ✅ **Documentation**: Dokumentasi yang komprehensif

## 📁 Struktur Proyek

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   ├── admin/                    # Admin dashboard
│   ├── dashboard/                # User dashboard
│   └── globals.css              # Global styles
├── components/                   # Reusable components
│   ├── ui/                      # Shadcn UI components
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   ├── data-table/              # Data table components
│   ├── charts/                  # Chart components
│   ├── mobile/                  # Mobile-specific components
│   ├── responsive/              # Responsive components
│   ├── loading/                 # Loading components
│   └── error-boundary.tsx       # Error boundary
├── lib/                         # Utilities and configurations
│   ├── stores/                  # Zustand stores
│   ├── validations/             # Zod schemas
│   ├── cache/                   # Cache management
│   ├── theme.ts                 # Theme configuration
│   └── utils.ts                 # Utility functions
├── hooks/                       # Custom React hooks
├── __tests__/                   # Test files
└── docs/                        # Documentation
```

## 🎨 Design System

### Theme Configuration
- **Colors**: Primary, secondary, success, warning, error dengan 50-950 scale
- **Typography**: Inter font family dengan responsive sizing
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system
- **Border Radius**: Consistent border radius values

### Component Library
- **Base Components**: Button, Input, Card, Badge, etc.
- **Form Components**: FormField, FormInput, FormSelect, etc.
- **Layout Components**: Header, Sidebar, Footer, Navigation
- **Data Components**: DataTable, ChartContainer, etc.
- **Mobile Components**: MobileNav, MobileCard, etc.

## 🔧 State Management

### Auth Store
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: string[]
}
```

### UI Store
```typescript
interface UIState {
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  modals: Record<string, boolean>
  toasts: Toast[]
  breadcrumbs: Breadcrumb[]
}
```

### Notification Store
```typescript
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  filters: NotificationFilters
  sortBy: string
  sortOrder: "asc" | "desc"
}
```

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
- Responsive containers dan grids
- Mobile navigation dengan bottom nav
- Touch-friendly interactions
- Optimized loading states

## 🚀 Performance

### Lazy Loading
- Component lazy loading
- Image lazy loading
- Route-based code splitting
- Virtual scrolling untuk data besar

### Caching
- Memory cache untuk data sementara
- LocalStorage cache untuk persistensi
- SessionStorage cache untuk session data
- Cache invalidation patterns

### Optimization
- Debounced inputs
- Throttled scroll events
- Memoized components
- Efficient re-renders

## 🧪 Testing

### Unit Testing
- Jest + React Testing Library
- Component testing
- Store testing
- Utility function testing

### E2E Testing
- Playwright setup
- User flow testing
- Cross-browser testing

### Test Utilities
- Custom render function
- Mock data generators
- Accessibility testing helpers
- Performance testing helpers

## 📊 Data Visualization

### Chart Components
- Line charts
- Bar charts
- Pie charts
- Area charts
- Scatter plots

### Chart Features
- Responsive design
- Interactive tooltips
- Export functionality
- Time range selection
- Custom styling

## 🔐 Security

### Authentication
- JWT-based authentication
- Role-based access control
- Permission checking
- Session management

### Data Validation
- Zod schemas untuk validasi
- Client-side validation
- Server-side validation
- Type safety

## 📚 Usage Examples

### Using Components
```tsx
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { FormInput } from "@/components/forms/form-field"

function MyComponent() {
  return (
    <div>
      <FormInput
        label="Email"
        placeholder="Enter your email"
        required
      />
      <Button>Submit</Button>
    </div>
  )
}
```

### Using Stores
```tsx
import { useAuthStore } from "@/lib/stores/auth-store"
import { useUIStore } from "@/lib/stores/ui-store"

function MyComponent() {
  const { user, login, logout } = useAuthStore()
  const { theme, setTheme } = useUIStore()
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => setTheme("dark")}>
        Toggle Theme
      </button>
    </div>
  )
}
```

### Using Forms
```tsx
import { useForm } from "@/hooks/use-form"
import { loginSchema } from "@/lib/validations/schemas"

function LoginForm() {
  const form = useForm({
    schema: loginSchema,
    onSubmit: async (data) => {
      await login(data.email, data.password)
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <FormInput
        {...form.register("email")}
        label="Email"
        error={form.formState.errors.email?.message}
      />
      <FormInput
        {...form.register("password")}
        label="Password"
        type="password"
        error={form.formState.errors.password?.message}
      />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Login
      </Button>
    </form>
  )
}
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm atau yarn
- Git

### Installation
```bash
# Clone repository
git clone <repository-url>
cd go-absen

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Scripts
- `npm run dev`: Development server
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run lint`: ESLint
- `npm run test`: Unit tests
- `npm run test:e2e`: E2E tests

## 📈 Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size analysis
- Runtime performance metrics

### Error Tracking
- Error boundary integration
- Error logging
- User feedback collection

## 🔄 Deployment

### Build Optimization
- Code splitting
- Tree shaking
- Image optimization
- CSS optimization

### Environment Configuration
- Development
- Staging
- Production

## 🤝 Contributing

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue
- Check documentation
- Contact development team

---

**Last Updated**: January 2024
**Version**: 1.0.0