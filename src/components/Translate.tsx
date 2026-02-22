"use client";

import { useLanguage } from "./LanguageContext";

export function Translate({ tKey, ...values }: { tKey: string; [key: string]: any }) {
  const { t } = useLanguage();
  let text = t(tKey);
  
  if (values && Object.keys(values).length > 0) {
    Object.entries(values).forEach(([key, val]) => {
      if (key !== "tKey") {
        text = text.replace(`{{${key}}}`, String(val));
      }
    });
  }
  
  return <>{text}</>;
}
