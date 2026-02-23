"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(api("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                setError("Email o contraseña incorrectos.");
                return;
            }

            const data = await response.json();

            const token = data.token;

            if (!token) {
                setError("Login OK, pero no llegó el token en la respuesta.");
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("nombre", data.nombre);
            localStorage.setItem("rol", data.rol);

            router.push("/"); // o /dashboard
        } catch (err) {
            console.log(err);
            setError(
                "No se pudo conectar al servidor (¿NEXT_PUBLIC_API_URL configurada? ¿API encendida?)."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Login</h1>

            <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gap: 12, maxWidth: 320 }}
            >
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>

                {error && <p style={{ color: "tomato" }}>{error}</p>}
            </form>
        </main>
    );
}
