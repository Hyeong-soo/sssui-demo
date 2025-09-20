import { useEffect, useState } from "react";
import { init } from "sssui_wasm";

export default function useWasmInit() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      init();
      if (mounted) setInitialized(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    return () => { mounted = false; };
  }, []);

  return { initialized, error } as const;
}

