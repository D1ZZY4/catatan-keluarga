import { useCallback, useEffect, useState } from "react";
import { getSetting, setSetting } from "@/shared/db/db";
import { setDateFormat, type DateFormatKey } from "@/shared/utils/format";

export type TextSizeKey = "sm" | "md" | "lg";

const TEXT_SIZE_PX: Record<TextSizeKey, string> = {
  sm: "14px",
  md: "16px",
  lg: "18px",
};

function applyTextSize(size: TextSizeKey) {
  document.documentElement.style.fontSize = TEXT_SIZE_PX[size] ?? "16px";
}

export async function loadDisplaySettings() {
  const fmt = (await getSetting<DateFormatKey>("dateFormat")) ?? "id";
  const size = (await getSetting<TextSizeKey>("textSize")) ?? "md";
  const base = (await getSetting<string>("baseCurrency")) ?? "IDR";
  setDateFormat(fmt);
  applyTextSize(size);
  return { dateFormat: fmt, textSize: size, baseCurrency: base };
}

export function useDisplaySettings() {
  const [dateFormat, setDateFormatState] = useState<DateFormatKey>("id");
  const [textSize, setTextSizeState] = useState<TextSizeKey>("md");
  const [baseCurrency, setBaseCurrencyState] = useState<string>("IDR");

  useEffect(() => {
    void loadDisplaySettings().then(({ dateFormat: f, textSize: s, baseCurrency: b }) => {
      setDateFormatState(f);
      setTextSizeState(s);
      setBaseCurrencyState(b);
    });
  }, []);

  const updateDateFormat = useCallback(async (fmt: DateFormatKey) => {
    setDateFormat(fmt);
    setDateFormatState(fmt);
    await setSetting("dateFormat", fmt);
  }, []);

  const updateTextSize = useCallback(async (size: TextSizeKey) => {
    applyTextSize(size);
    setTextSizeState(size);
    await setSetting("textSize", size);
  }, []);

  const updateBaseCurrency = useCallback(async (currency: string) => {
    setBaseCurrencyState(currency);
    await setSetting("baseCurrency", currency);
  }, []);

  return {
    dateFormat,
    textSize,
    baseCurrency,
    updateDateFormat,
    updateTextSize,
    updateBaseCurrency,
  };
}
