"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";

type VentaItem = {
    ventaId: number;
    fecha: string;
    total: number;
    cajero: string;
};

type ReporteDiarioDto = {
    fecha: string;
    cantidadVentas: number;
    totalVendido: number;
    ventas: VentaItem[];
};

type ReporteRangoDto = {
    desde: string;
    hasta: string;
    cantidadVentas: number;
    totalVendido: number;
    ventas: VentaItem[];
};

export default function ReportesPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [reporteDiario, setReporteDiario] = useState<ReporteDiarioDto | null>(null);
    const [reporteRango, setReporteRango] = useState<ReporteRangoDto | null>(null);

    // YYYY-MM-DD (input date)
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    async function cargarReporteDiario() {
        setLoading(true);
        setError(null);
        setReporteDiario(null);

        try {
            const res = await fetch(api("/api/ventas/reporte-diario"), {
                headers: { Authorization: `Bearer ${token()}` },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo cargar el reporte diario (HTTP ${res.status}). ${txt}`);
                return;
            }

            const data = (await res.json()) as ReporteDiarioDto;
            setReporteDiario(data);
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API (reporte diario).");
        } finally {
            setLoading(false);
        }
    }

    async function cargarReporteRango() {
        setLoading(true);
        setError(null);
        setReporteRango(null);

        try {
            if (!desde || !hasta) {
                setError("Selecciona ambas fechas (desde y hasta).");
                return;
            }

            // ya lo estás mandando como YYYY-MM-DD, perfecto para tu API
            const qs = new URLSearchParams({ desde, hasta }).toString();

            const res = await fetch(api(`/api/ventas/reporte-rango?${qs}`), {
                headers: { Authorization: `Bearer ${token()}` },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo cargar el reporte por rango (HTTP ${res.status}). ${txt}`);
                return;
            }

            const data = (await res.json()) as ReporteRangoDto;
            setReporteRango(data);
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API (reporte por rango).");
        } finally {
            setLoading(false);
        }
    }

    function RenderVentas({ ventas }: { ventas: VentaItem[] }) {
        if (!ventas || ventas.length === 0) return <p>No hay ventas en este período.</p>;

        return (
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
        );
    }

    return (
        <RequireAuth allowedRoles={["Admin"]}>
            <main style={{ padding: 24, display: "grid", gap: 14, maxWidth: 900 }}>
                <h1>Reportes</h1>

                {error && <p style={{ color: "tomato" }}>{error}</p>}

                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
                    <h3>Reporte diario (hoy)</h3>
                    <button onClick={cargarReporteDiario} disabled={loading} style={{ width: 160 }}>
                        {loading ? "Cargando..." : "Cargar"}
                    </button>

                    {reporteDiario && (
                        <>
                            <p>
                                Fecha: <b>{reporteDiario.fecha}</b> — Ventas: <b>{reporteDiario.cantidadVentas}</b> — Total vendido:{" "}
                                <b>{reporteDiario.totalVendido}</b>
                            </p>
                            <RenderVentas ventas={reporteDiario.ventas} />
                        </>
                    )}
                </section>

                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
                    <h3>Reporte por rango</h3>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                        <label style={{ display: "grid", gap: 6 }}>
                            Desde
                            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ padding: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            Hasta
                            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ padding: 8 }} />
                        </label>

                        <button onClick={cargarReporteRango} disabled={loading} style={{ height: 38, width: 140 }}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>

                    {reporteRango && (
                        <>
                            <p>
                                Desde: <b>{reporteRango.desde}</b> — Hasta: <b>{reporteRango.hasta}</b> — Ventas:{" "}
                                <b>{reporteRango.cantidadVentas}</b> — Total vendido: <b>{reporteRango.totalVendido}</b>
                            </p>
                            <RenderVentas ventas={reporteRango.ventas} />
                        </>
                    )}
                </section>
            </main>
        </RequireAuth>
    );
}