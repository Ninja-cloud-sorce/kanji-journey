import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;

try {
  createRoot(root).render(<App />);
} catch (err) {
  root.innerHTML = `
    <div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d0d0f;color:#fff;gap:16px;font-family:sans-serif;padding:24px;text-align:center">
      <div style="font-size:2rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase">App failed to start</div>
      <p style="color:rgba(255,255,255,0.4);font-size:0.85rem;max-width:420px">${(err as Error).message ?? 'Missing environment configuration. Check your .env file.'}</p>
      <a href="/" style="margin-top:8px;padding:12px 28px;background:#fff;color:#000;font-weight:800;font-size:0.75rem;letter-spacing:0.3em;text-transform:uppercase;border-radius:999px;text-decoration:none">Retry</a>
    </div>
  `;
}
