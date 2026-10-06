"use client";

import { useEffect } from "react";

// Faz os pop-ups do navegador (alert/confirm) e o título da aba também
// aparecerem em MAIÚSCULAS. O CSS não alcança esses elementos.
export default function MaiusculasGlobais() {
  useEffect(() => {
    const alertOriginal = window.alert;
    const confirmOriginal = window.confirm;
    window.alert = (msg) => alertOriginal.call(window, String(msg ?? "").toUpperCase());
    window.confirm = (msg) => confirmOriginal.call(window, String(msg ?? "").toUpperCase());
    document.title = document.title.toUpperCase();
    return () => {
      window.alert = alertOriginal;
      window.confirm = confirmOriginal;
    };
  }, []);
  return null;
}
