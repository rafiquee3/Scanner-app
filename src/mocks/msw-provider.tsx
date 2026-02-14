"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (process.env.NODE_ENV === "development") {
        const { initMocks } = await import("./index");
        await initMocks();
        setIsReady(true);
      } else {
        setIsReady(true);
      }
    };

    if (!isReady) {
      init();
    }
  }, [isReady]);

  if (!isReady) return null;

  return <>{children}</>;
}