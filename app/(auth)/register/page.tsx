"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerUser({ name, email, password });
      if ((result as { error?: string }).error) {
        setMessage((result as { error?: string }).error || "");
        return;
      }
      if ((result as { success?: boolean; redirectUrl?: string }).success && (result as { success?: boolean; redirectUrl?: string }).redirectUrl) {
        router.push((result as { success?: boolean; redirectUrl?: string }).redirectUrl as string);
      }
    } catch {
      setMessage("Terjadi error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm w-full max-w-md
                  animate-fade-in-up hover:shadow-md hover:scale-[1.01] 
                  transition-all duration-300"
      >
        <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-foreground animate-fade-in-down">
          Register
        </h1>

        <div className="mb-4 animate-fade-in delay-100">
          <input
            type="text"
            placeholder="Nama"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-input rounded-lg 
                      bg-background text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-ring 
                      focus:border-ring transition-all duration-200
                      focus:scale-[1.01] text-sm sm:text-base"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4 animate-fade-in delay-200">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-input rounded-lg 
                      bg-background text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-ring 
                      focus:border-ring transition-all duration-200
                      focus:scale-[1.01] text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4 animate-fade-in delay-300">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-input rounded-lg 
                      bg-background text-foreground placeholder:text-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-ring 
                      focus:border-ring transition-all duration-200
                      focus:scale-[1.01] text-sm sm:text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 sm:py-2.5 rounded-lg font-medium 
                    shadow-sm hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] 
                    active:scale-[0.98] transition-all duration-200 animate-fade-in delay-400
                    text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Register"}
        </button>

        <p className="mt-4 text-center text-xs sm:text-sm text-muted-foreground">
          Sudah punya akun? <Link className="underline" href="/login">Login</Link>
        </p>

        {message && (
          <p className="mt-4 text-center text-xs sm:text-sm text-destructive animate-shake">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
