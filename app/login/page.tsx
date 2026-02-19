"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
            const response = await fetch("https://localhost:7107/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                // opcional: leer mensaje si tu API lo devuelve
                setError("Email o contraseña incorrectos.");
                return;
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("nombre", data.nombre);
            localStorage.setItem("rol", data.rol);


            const token = data.token;

            if (!token) {
                setError("Login OK, pero no llegó el token en la respuesta.");
                return;
            }

            localStorage.setItem("token", token);

            router.push("/"); // o /dashboard
        } catch {
            setError("No se pudo conectar al servidor (¿API encendida? ¿certificado HTTPS?).");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Login</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 320 }}>
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

