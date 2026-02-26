"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";

// const API_BASE = "https://localhost:7107"; // ya no se usa

type VentaItem = {
    ventaId: number;
    fecha: string;
    total: number;
    cajero: string;
};

export default function VentasAdminPage() {
    const [ventas, setVentas] = useState<VentaItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    useEffect(() => {
        async function cargar() {
            setError(null);

            try {
                const res = await fetch(api("/api/ventas"), {
                    headers: { Authorization: `Bearer ${token()}` },
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    setError(`No se pudo cargar ventas (HTTP ${res.status}). ${txt}`);
                    return;
                }

                const data = (await res.json()) as VentaItem[];
                setVentas(data);
            } catch (e) {
                console.log(e);
                setError("Error conectando con la API.");
            }
        }

        cargar();
    }, []);

    return (
        <RequireAuth allowedRoles={["Admin"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 900 }}>
                <h1>Ventas (Admin)</h1>

                {error && <p style={{ color: "tomato" }}>{error}</p>}

                {ventas.length === 0 && !error ? (
                    <p>No hay ventas registradas.</p>
                ) : (
                    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {ventas.map((v) => (
                                <li key={v.ventaId} style={{ marginBottom: 6 }}>
                                    <Link href={`/ventas/${v.ventaId}`}>Venta #{v.ventaId}</Link>{" "}
                                    — {v.fecha} — Total: <b>{v.total}</b> — Cajero: <b>{v.cajero}</b>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </RequireAuth>
    );
}