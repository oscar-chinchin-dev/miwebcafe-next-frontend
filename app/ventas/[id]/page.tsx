"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";

const API_BASE = "https://localhost:7107";

type VentaDetalle = {
    ventaId: number;
    fecha: string;
    total: number;
    usuarioNombre: string;
    detalles: Array<{
        productoNombre: string;
        cantidad: number;
        precio: number;
        subtotal: number;
    }>;
};

export default function VentaDetallePage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);

    const [venta, setVenta] = useState<VentaDetalle | null>(null);
    const [error, setError] = useState<string | null>(null);

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    useEffect(() => {
        async function cargar() {
            setError(null);

            try {
                const res = await fetch(`${API_BASE}/api/ventas/${id}`, {
                    headers: { Authorization: `Bearer ${token()}` },
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    setError(`No se pudo cargar la venta (HTTP ${res.status}). ${txt}`);
                    return;
                }

                const data = (await res.json()) as VentaDetalle;
                setVenta(data);
            } catch (e) {
                console.log(e);
                setError("Error conectando con la API.");
            }
        }

        if (!Number.isNaN(id)) cargar();
    }, [id]);

    return (
        <RequireAuth allowedRoles={["Admin", "Cajero"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 800 }}>
                <h1>Detalle de venta</h1>

                {error && <p style={{ color: "tomato" }}>{error}</p>}
                {!venta && !error && <p>Cargando...</p>}

                {venta && (
                    <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        <p>
                            Venta <b>#{venta.ventaId}</b> — Total: <b>{venta.total}</b>
                        </p>
                        <p>
                            Fecha: <b>{venta.fecha}</b>
                        </p>
                        <p>
                            Cajero: <b>{venta.usuarioNombre}</b>
                        </p>

                        <h3>Productos</h3>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {venta.detalles.map((d, i) => (
                                <li key={i}>
                                    {d.productoNombre} — {d.cantidad} x {d.precio} = <b>{d.subtotal}</b>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
        </RequireAuth>
    );
}
