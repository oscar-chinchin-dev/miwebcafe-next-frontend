"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";

type CierreItem = {
    cierreCajaId: number;
    cajero: string;
    fechaApertura: string;
    fechaCierre: string | null;
    estado: string;
    montoInicial: number;
    totalVentas: number;
    cantidadVentas: number;
    montoFinalDeclarado: number;
};

export default function CierresAdminPage() {
    const [cierres, setCierres] = useState<CierreItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    useEffect(() => {
        async function cargar() {
            setError(null);

            try {
                const res = await fetch(api("/api/caja/cierres"), {
                    headers: { Authorization: `Bearer ${token()}` },
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    setError(`No se pudo cargar cierres (HTTP ${res.status}). ${txt}`);
                    return;
                }

                const data = (await res.json()) as CierreItem[];
                setCierres(data);
            } catch (e) {
                console.log(e);
                setError("Error conectando con la API.");
            }
        }

        cargar();
    }, []);

    function money(n: number) {
        return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
    }

    function dt(s: string | null) {
        if (!s) return "—";
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? s : d.toLocaleString("es-CL");
    }

    return (
        <RequireAuth allowedRoles={["Admin"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 1100 }}>
                <h1>Historial de cierres</h1>

                {error && <p style={{ color: "tomato" }}>{error}</p>}

                {cierres.length === 0 && !error ? (
                    <p>No hay cierres registrados.</p>
                ) : (
                    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                                    <th style={{ padding: 10 }}>ID</th>
                                    <th style={{ padding: 10 }}>Cajero</th>
                                    <th style={{ padding: 10 }}>Apertura</th>
                                    <th style={{ padding: 10 }}>Cierre</th>
                                    <th style={{ padding: 10 }}>Estado</th>
                                    <th style={{ padding: 10 }}>Total ventas</th>
                                    <th style={{ padding: 10 }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cierres.map((c) => (
                                    <tr key={c.cierreCajaId} style={{ borderBottom: "1px solid #222" }}>
                                        <td style={{ padding: 10, fontWeight: 700 }}>#{c.cierreCajaId}</td>
                                        <td style={{ padding: 10 }}>{c.cajero}</td>
                                        <td style={{ padding: 10 }}>{dt(c.fechaApertura)}</td>
                                        <td style={{ padding: 10 }}>{dt(c.fechaCierre)}</td>
                                        <td style={{ padding: 10 }}>{c.estado}</td>
                                        <td style={{ padding: 10, fontWeight: 700 }}>{money(c.totalVentas)}</td>
                                        <td style={{ padding: 10 }}>
                                            {/* si más adelante creas el detalle */}
                                            <Link href={`/cierres/${c.cierreCajaId}`} style={{ textDecoration: "none" }}>
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p style={{ marginTop: 10, opacity: 0.75 }}>
                            * El botón “Ver” apunta a <code>/cierres/[id]</code> (lo implementamos después si quieres el detalle).
                        </p>
                    </div>
                )}
            </main>
        </RequireAuth>
    );
}