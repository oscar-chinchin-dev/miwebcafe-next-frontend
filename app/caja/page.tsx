"use client";

import { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";



type CajaActual = {
    cierreCajaId: number;
    estado: string;
    fechaApertura: string;
    montoInicial: number;
};

export default function CajaPage() {
    const [caja, setCaja] = useState<CajaActual | null>(null);

    // abrir
    const [montoInicial, setMontoInicial] = useState<number>(0);

    // cerrar
    const [montoFinalDeclarado, setMontoFinalDeclarado] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function getToken() {
        return localStorage.getItem("token") ?? "";
    }

    async function cargarCajaActual() {
        setError(null);
        setMsg(null);

        try {
            const res = await fetch(api("/api/caja/actual"), {
                headers: { Authorization: `Bearer ${getToken()}` },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No pude obtener la caja actual (HTTP ${res.status}). ${txt}`);
                return;
            }

            const text = await res.text();

            if (!text) {
                // respuesta vacía => no hay caja abierta
                setCaja(null);
                return;
            }

            const data = JSON.parse(text) as CajaActual | null;
            setCaja(data);

            // si hay caja abierta, precarga el monto inicial
            if (data?.montoInicial != null) setMontoInicial(data.montoInicial);
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API.");
        }
    }

    async function abrirCaja() {
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            const res = await fetch(api("/api/caja/abrir"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ montoInicial }),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo abrir caja (HTTP ${res.status}). ${txt}`);
                return;
            }

            setMsg("Caja abierta correctamente.");
            await cargarCajaActual();
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API al abrir caja.");
        } finally {
            setLoading(false);
        }
    }

    async function cerrarCaja() {
        if (!caja) {
            setError("No hay caja abierta para cerrar.");
            return;
        }

        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            const res = await fetch(api(`/api/caja/${caja.cierreCajaId}/cerrar`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ montoFinalDeclarado }),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo cerrar caja (HTTP ${res.status}). ${txt}`);
                return;
            }

            setMsg("Caja cerrada correctamente.");
            await cargarCajaActual();
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API al cerrar caja.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarCajaActual();
    }, []);

    const hayCajaAbierta = caja?.estado === "ABIERTA";

    return (
        <RequireAuth allowedRoles={["Admin", "Cajero"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 640 }}>
                <h1>Caja</h1>

                <button
                    onClick={cargarCajaActual}
                    disabled={loading}
                    style={{ width: 170 }}
                >
                    Actualizar
                </button>

                {error && <p style={{ color: "tomato" }}>{error}</p>}
                {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}

                <section
                    style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}
                >
                    <h3>Estado actual</h3>

                    {!caja ? (
                        <p>No tienes una caja ABIERTA ahora mismo.</p>
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            <li>
                                <b>ID:</b> {caja.cierreCajaId}
                            </li>
                            <li>
                                <b>Estado:</b> {caja.estado}
                            </li>
                            <li>
                                <b>Apertura:</b> {caja.fechaApertura}
                            </li>
                            <li>
                                <b>Monto inicial:</b> {caja.montoInicial}
                            </li>
                        </ul>
                    )}
                </section>

                <section
                    style={{
                        border: "1px solid #333",
                        borderRadius: 10,
                        padding: 12,
                        display: "grid",
                        gap: 10,
                    }}
                >
                    <h3>Abrir caja</h3>

                    <label style={{ display: "grid", gap: 6, maxWidth: 260 }}>
                        Monto inicial
                        <input
                            type="number"
                            value={montoInicial}
                            onChange={(e) => setMontoInicial(Number(e.target.value))}
                            style={{ padding: 8 }}
                        />
                    </label>

                    <button
                        onClick={abrirCaja}
                        disabled={loading || hayCajaAbierta}
                        style={{ width: 180 }}
                    >
                        {hayCajaAbierta
                            ? "Caja ya está abierta"
                            : loading
                                ? "Abriendo..."
                                : "Abrir caja"}
                    </button>
                </section>

                <section
                    style={{
                        border: "1px solid #333",
                        borderRadius: 10,
                        padding: 12,
                        display: "grid",
                        gap: 10,
                    }}
                >
                    <h3>Cerrar caja</h3>

                    <label style={{ display: "grid", gap: 6, maxWidth: 260 }}>
                        Monto final declarado
                        <input
                            type="number"
                            value={montoFinalDeclarado}
                            onChange={(e) => setMontoFinalDeclarado(Number(e.target.value))}
                            style={{ padding: 8 }}
                        />
                    </label>

                    <button
                        onClick={cerrarCaja}
                        disabled={loading || !hayCajaAbierta}
                        style={{ width: 180 }}
                    >
                        {!hayCajaAbierta
                            ? "No hay caja abierta"
                            : loading
                                ? "Cerrando..."
                                : "Cerrar caja"}
                    </button>
                </section>
            </main>
        </RequireAuth>
    );
}
