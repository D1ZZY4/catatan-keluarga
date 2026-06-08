import { useCallback, useEffect, useState } from "react";
import { db } from "@/shared/db/db";
import { DEFAULT_QUICK_ACTIONS, type QuickActionConfig } from "./quickActionsConfig";

const SETTINGS_KEY = "quickActions";

export function useQuickActions() {
  const [actions, setActions] = useState<QuickActionConfig[]>(DEFAULT_QUICK_ACTIONS);

  useEffect(() => {
    let cancelled = false;
    db.settings.get(SETTINGS_KEY).then((row) => {
      if (cancelled) return;
      if (row?.value && Array.isArray(row.value) && row.value.length > 0) {
        setActions(row.value as QuickActionConfig[]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveActions = useCallback(async (next: QuickActionConfig[]) => {
    setActions(next);
    await db.settings.put({ key: SETTINGS_KEY, value: next });
  }, []);

  return { actions, saveActions };
}
