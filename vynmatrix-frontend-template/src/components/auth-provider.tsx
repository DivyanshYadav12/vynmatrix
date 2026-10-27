"use client";

import { useState } from "react";
import { LoginModal } from "./login-modal";
import { isAuthenticated } from "@/lib/api-client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  if (!authenticated) {
    return <LoginModal onSuccess={() => setAuthenticated(true)} />;
  }

  return <>{children}</>;
}
