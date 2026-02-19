"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "./components/RequireAuth";

export default function Home() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("");

  useEffect(() => {
    setNombre(localStorage.getItem("nombre") ?? "");
    setRol(localStorage.getItem("rol") ?? "");
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    router.push("/login");
  }

  return (
    <RequireAuth allowedRoles={["Admin"]}>
      <main style={{ padding: 24, display: "grid", gap: 12 }}>
        <h1>Bienvenido</h1>
        <p>
          Hola, <b>{nombre}</b> — Rol: <b>{rol}</b>
        </p>

        <button onClick={logout} style={{ width: 160 }}>
          Cerrar sesión
        </button>
      </main>
    </RequireAuth>
  );
}