"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (isLoggedIn === "true" && loginTime) {
      const now = new Date().getTime();
      const loginTimestamp = parseInt(loginTime, 10);
      const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        // Session expired
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loginTime");
        router.replace("/");
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/");
    }
  }, [router]);

  return null;
}
