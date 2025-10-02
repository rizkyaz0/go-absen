import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function PageLoading({ text = "Memuat..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-r-primary/40 animate-spin animation-delay-75" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">{text}</p>
          <div className="flex gap-1 justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-100" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-muted rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b last:border-b-0 p-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="h-3 bg-muted rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}