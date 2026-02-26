"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import { api } from "../../lib/api";

type CierreResumen = {
  cierreCajaId: number;
  cajero: string;
  fechaApertura: string;
  fechaCierre: string | null;
  estado: string;
  montoInicial: number;
  totalVentas: number;
  cantidadVentas: number;
  montoFinalDeclarado: number | null;
  esperado: number;
  diferencia: number;
};

export default function CierreDetallePage() {
  const params = useParams();
  const id = Number((params as any)?.id);

  const [data, setData] = useState<CierreResumen | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = () => localStorage.getItem("token") ?? "";

  const money = (n: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);

  const dt = (s: string | null) => {
    if (!s) return "—";
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString("es-CL");
  };

  useEffect(() => {
    async function cargar() {
      setError(null);
      setData(null);

      try {
        const res = await fetch(api(`/api/caja/${id}/resumen`), {
          headers: { Authorization: `Bearer ${token()}` },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setError(`No se pudo cargar el cierre (HTTP ${res.status}). ${txt}`);
          return;
        }

        const json = (await res.json()) as CierreResumen;
        setData(json);
      } catch (e) {
        console.log(e);
        setError("Error conectando con la API.");
      }
    }

    if (!Number.isNaN(id) && id > 0) cargar();
  }, [id]);

  return (
    <RequireAuth allowedRoles={["Admin", "Cajero"]}>
      <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 900 }}>
        <h1>Detalle de cierre</h1>

        {error && <p style={{ color: "tomato" }}>{error}</p>}
        {!data && !error && <p>Cargando...</p>}

        {data && (
          <section
            style={{
              border: "1px solid #333",
              borderRadius: 10,
              padding: 12,
              display: "grid",
              gap: 10,
            }}
          >
            <p>
              Cierre <b>#{data.cierreCajaId}</b> — Estado: <b>{data.estado}</b>
            </p>

            <div style={{ display: "grid", gap: 6 }}>
              <div>
                Cajero: <b>{data.cajero}</b>
              </div>
              <div>
                Apertura: <b>{dt(data.fechaApertura)}</b>
              </div>
              <div>
                Cierre: <b>{dt(data.fechaCierre)}</b>
              </div>
            </div>

            <hr style={{ borderColor: "#222" }} />

            <div style={{ display: "grid", gap: 6 }}>
              <div>
                Monto inicial: <b>{money(data.montoInicial)}</b>
              </div>
              <div>
                Total ventas: <b>{money(data.totalVentas)}</b> ({data.cantidadVentas} ventas)
              </div>
              <div>
                Monto final declarado: <b>{money(data.montoFinalDeclarado ?? 0)}</b>
              </div>
            </div>

            <hr style={{ borderColor: "#222" }} />

            <div style={{ display: "grid", gap: 6 }}>
              <div>
                Esperado: <b>{money(data.esperado)}</b>
              </div>
              <div>
                Diferencia:{" "}
                <b style={{ color: data.diferencia === 0 ? "lightgreen" : "tomato" }}>
                  {money(data.diferencia)}
                </b>
              </div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>
                (Diferencia = declarado - esperado)
              </div>
            </div>
          </section>
        )}
      </main>
    </RequireAuth>
  );
}