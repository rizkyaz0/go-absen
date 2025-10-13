import React, { ReactElement } from "react"
import { render, RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Mock theme provider
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    {children}
  </ThemeProvider>
)

// Mock query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  theme?: "light" | "dark"
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { theme = "light", queryClient = createTestQueryClient(), ...renderOptions } = options

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MockThemeProvider>
          {children}
        </MockThemeProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
export * from "@testing-library/react"
export { customRender as render }

// Mock data generators
export const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  position: "Software Engineer",
  department: "Engineering",
  hireDate: "2023-01-15",
  status: "active" as const,
  role: "employee" as const,
  avatar: "/avatars/01.png",
  lastLogin: new Date().toISOString(),
  createdAt: "2023-01-15T00:00:00Z",
  updatedAt: new Date().toISOString(),
}

export const mockAttendance = {
  id: "1",
  userId: "1",
  date: "2024-01-15",
  checkIn: "09:00",
  checkOut: "17:00",
  status: "present" as const,
  notes: "",
  location: "Office",
}

export const mockLeave = {
  id: "1",
  userId: "1",
  type: "vacation" as const,
  startDate: "2024-01-20",
  endDate: "2024-01-25",
  days: 5,
  reason: "Family vacation",
  status: "pending" as const,
  comments: "",
}

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockFetch = (data: any, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

export const mockFetchError = (message = "Network error") => {
  global.fetch = jest.fn().mockRejectedValue(new Error(message))
}

// Form testing helpers
export const fillForm = async (container: HTMLElement, data: Record<string, string>) => {
  const { fireEvent } = await import("@testing-library/react")
  
  for (const [name, value] of Object.entries(data)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      fireEvent.change(input, { target: { value } })
    }
  }
}

export const submitForm = async (container: HTMLElement) => {
  const { fireEvent } = await import("@testing-library/react")
  const form = container.querySelector("form")
  if (form) {
    fireEvent.submit(form)
  }
}

// Mock router helpers
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

// Mock zustand stores
export const mockAuthStore = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  permissions: ["read:profile", "update:profile"],
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  refreshToken: jest.fn(),
  clearError: jest.fn(),
  setLoading: jest.fn(),
  setUser: jest.fn(),
  checkPermission: jest.fn(),
}

export const mockUIStore = {
  theme: "light" as const,
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  loading: false,
  modals: {},
  toasts: [],
  breadcrumbs: [],
  pageTitle: "",
  pageDescription: undefined,
  setTheme: jest.fn(),
  toggleSidebar: jest.fn(),
  setSidebarOpen: jest.fn(),
  setSidebarCollapsed: jest.fn(),
  toggleMobileMenu: jest.fn(),
  setMobileMenuOpen: jest.fn(),
  setLoading: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  toggleModal: jest.fn(),
  isModalOpen: jest.fn(),
  addToast: jest.fn(),
  removeToast: jest.fn(),
  clearToasts: jest.fn(),
  setBreadcrumbs: jest.fn(),
  addBreadcrumb: jest.fn(),
  setPageTitle: jest.fn(),
  setPageDescription: jest.fn(),
  reset: jest.fn(),
}

// Component testing helpers
export const createMockProps = <T extends Record<string, any>>(overrides: Partial<T> = {}): T => {
  return {
    ...overrides,
  } as T
}

// Accessibility testing helpers
export const checkA11y = async (container: HTMLElement) => {
  const { axe, toHaveNoViolations } = await import("jest-axe")
  expect.extend(toHaveNoViolations)
  
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
  return mockIntersectionObserver
}

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.ResizeObserver = mockResizeObserver
  return mockResizeObserver
}