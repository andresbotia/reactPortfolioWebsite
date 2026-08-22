import { useState } from "react";

function detectWebGL() {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  const context =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");
  return Boolean(context);
}

export function useWebGLSupported() {
  const [supported] = useState(detectWebGL);

  return supported;
}
