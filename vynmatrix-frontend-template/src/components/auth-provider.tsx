"use client";

import { useEffect, useState } from "react";
import { LoginModal } from "./login-modal";
import { isAuthenticated } from "@/lib/api-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setIsClient(true);
  }, []);

  // Show nothing during SSR to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  if (!authenticated) {
    return <LoginModal onSuccess={() => setAuthenticated(true)} />;
  }

  return <>{children}</>;
}
