import { act, renderHook } from "@testing-library/react"
import { useAuthStore } from "@/lib/stores/auth-store"

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("AuthStore", () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().logout()
    jest.clearAllMocks()
  })

  it("should have initial state", () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.permissions).toEqual([])
  })

  it("should login successfully", async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login("test@example.com", "password")
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBeTruthy()
    expect(result.current.user?.email).toBe("test@example.com")
    expect(result.current.permissions).toContain("read:profile")
  })

  it("should handle login error", async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error("Login failed"))

    await act(async () => {
      await result.current.login("test@example.com", "wrongpassword")
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe("Login failed")
  })

  it("should logout successfully", () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    act(() => {
      result.current.setUser({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        position: "Developer",
        department: "Engineering",
        hireDate: "2023-01-01",
        status: "active",
        role: "employee",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      })
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.permissions).toEqual([])
  })

  it("should update profile", async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    act(() => {
      result.current.setUser({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        position: "Developer",
        department: "Engineering",
        hireDate: "2023-01-01",
        status: "active",
        role: "employee",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      })
    })

    await act(async () => {
      await result.current.updateProfile({ name: "Jane Doe" })
    })

    expect(result.current.user?.name).toBe("Jane Doe")
  })

  it("should check permissions correctly", () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set user with admin role
    act(() => {
      result.current.setUser({
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        position: "Admin",
        department: "IT",
        hireDate: "2023-01-01",
        status: "active",
        role: "admin",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      })
    })

    expect(result.current.checkPermission("read:users")).toBe(true)
    expect(result.current.checkPermission("delete:users")).toBe(true)
    expect(result.current.checkPermission("nonexistent:permission")).toBe(false)
  })

  it("should clear error", () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setUser(null)
    })

    // Simulate error
    act(() => {
      result.current.setUser(null)
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it("should set loading state", () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })
})