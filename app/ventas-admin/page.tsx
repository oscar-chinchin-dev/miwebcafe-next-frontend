"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";

type VentaItem = {
    ventaId: number;
    fecha: string;
    total: number;
    cajero: string;
};

type ReporteRangoResp = {
    Desde: string;
    Hasta: string;
    CantidadVentas: number;
    TotalVendido: number;
    Ventas: VentaItem[];
};

function hoyISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function VentasAdminPage() {
    const [desde, setDesde] = useState<string>(hoyISO());
    const [hasta, setHasta] = useState<string>(hoyISO());

    const [ventas, setVentas] = useState<VentaItem[]>([]);
    const [cantidad, setCantidad] = useState<number>(0);
    const [totalVendido, setTotalVendido] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    const rangoLabel = useMemo(() => `${desde} → ${hasta}`, [desde, hasta]);

    async function cargarReporte() {
        setError(null);

        if (!desde || !hasta) {
            setError("Selecciona 'desde' y 'hasta'.");
            return;
        }

        if (desde > hasta) {
            setError("La fecha 'desde' no puede ser mayor que 'hasta'.");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({ desde, hasta });

            const res = await fetch(api(`/api/ventas/reporte-rango?${params.toString()}`), {
                headers: { Authorization: `Bearer ${token()}` },
                cache: "no-store",
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo cargar el reporte (HTTP ${res.status}). ${txt}`);
                setVentas([]);
                setCantidad(0);
                setTotalVendido(0);
                return;
            }

            const data = (await res.json()) as ReporteRangoResp;

            setVentas(data.Ventas ?? []);
            setCantidad(data.CantidadVentas ?? 0);
            setTotalVendido(data.TotalVendido ?? 0);
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // carga inicial (hoy)
        cargarReporte();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <RequireAuth allowedRoles={["Admin"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 1000 }}>
                <h1>Reporte de ventas (Admin)</h1>

                {/* Filtros */}
                <section style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
                    <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontSize: 14 }}>Desde</label>
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #333" }}
                        />
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                        <label style={{ fontSize: 14 }}>Hasta</label>
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #333" }}
                        />
                    </div>

                    <button
                        onClick={cargarReporte}
                        disabled={loading}
                        style={{
                            padding: "9px 14px",
                            borderRadius: 8,
                            border: "1px solid #333",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Cargando..." : "Buscar"}
                    </button>

                    <div style={{ marginLeft: "auto", opacity: 0.8, fontSize: 14 }}>
                        Rango: <b>{rangoLabel}</b>
                    </div>
                </section>

                {error && <p style={{ color: "tomato", margin: 0 }}>{error}</p>}

                {/* KPIs */}
                <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>Cantidad de ventas</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{cantidad}</div>
                    </div>

                    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>Total vendido</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{totalVendido}</div>
                    </div>
                </section>

                {/* Listado */}
                {ventas.length === 0 && !error ? (
                    <p>No hay ventas en ese rango.</p>
                ) : (
                    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {ventas.map((v) => (
                                <li key={v.ventaId} style={{ marginBottom: 6 }}>
                                    <Link href={`/ventas/${v.ventaId}`}>Venta #{v.ventaId}</Link>{" "}
                                    — {new Date(v.fecha).toLocaleString()} — Total: <b>{v.total}</b> — Cajero: <b>{v.cajero}</b>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </RequireAuth>
    );
}