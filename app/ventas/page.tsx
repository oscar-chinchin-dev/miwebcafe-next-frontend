"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../components/RequireAuth";

const API_BASE = "https://localhost:7107";

type ProductoDto = {
    productoId: number;
    nombre: string;
    precio: number;
    stock: number;
    categoriaNombre: string;
    activo: boolean;
};

type Detalle = {
    productoId: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
};

export default function VentasPage() {
    const [productos, setProductos] = useState<ProductoDto[]>([]);
    const [loadingProductos, setLoadingProductos] = useState(false);

    const [productoIdSel, setProductoIdSel] = useState<number>(0);
    const [cantidadSel, setCantidadSel] = useState<number>(1);

    const [carrito, setCarrito] = useState<Detalle[]>([]);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const total = useMemo(
        () => carrito.reduce((acc, item) => acc + item.subtotal, 0),
        [carrito]
    );

    function token() {
        return localStorage.getItem("token") ?? "";
    }

    async function cargarProductos() {
        setLoadingProductos(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/productos`, {
                headers: { Authorization: `Bearer ${token()}` },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo cargar productos (HTTP ${res.status}). ${txt}`);
                return;
            }

            const data = (await res.json()) as ProductoDto[];
            const activos = data.filter((p) => p.activo);

            setProductos(activos);

            // setear selección inicial
            if (activos.length > 0) setProductoIdSel(activos[0].productoId);
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API al cargar productos.");
        } finally {
            setLoadingProductos(false);
        }
    }

    function agregarAlCarrito() {
        setMsg(null);
        setError(null);

        const p = productos.find((x) => x.productoId === productoIdSel);
        if (!p) {
            setError("Selecciona un producto válido.");
            return;
        }

        if (cantidadSel <= 0) {
            setError("La cantidad debe ser mayor a 0.");
            return;
        }

        if (p.stock < cantidadSel) {
            setError(`Stock insuficiente. Disponible: ${p.stock}`);
            return;
        }

        setCarrito((prev) => {
            // si ya existe en el carrito, suma cantidad
            const idx = prev.findIndex((i) => i.productoId === p.productoId);
            if (idx >= 0) {
                const copia = [...prev];
                const nuevaCantidad = copia[idx].cantidad + cantidadSel;

                if (p.stock < nuevaCantidad) {
                    setError(`Stock insuficiente para sumar. Disponible: ${p.stock}`);
                    return prev;
                }

                copia[idx] = {
                    ...copia[idx],
                    cantidad: nuevaCantidad,
                    subtotal: nuevaCantidad * copia[idx].precio,
                };
                return copia;
            }

            return [
                ...prev,
                {
                    productoId: p.productoId,
                    nombre: p.nombre,
                    precio: p.precio,
                    cantidad: cantidadSel,
                    subtotal: p.precio * cantidadSel,
                },
            ];
        });
    }

    function quitarDelCarrito(productoId: number) {
        setCarrito((prev) => prev.filter((x) => x.productoId !== productoId));
    }

    function limpiarCarrito() {
        setCarrito([]);
    }

    async function registrarVenta() {
        setLoading(true);
        setMsg(null);
        setError(null);

        try {
            // tu API espera: { detalles: [{ productoId, cantidad }, ...] }
            const body = {
                detalles: carrito.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
            };

            const res = await fetch(`${API_BASE}/api/ventas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                setError(`No se pudo registrar la venta (HTTP ${res.status}). ${txt}`);
                return;
            }

            const data = await res.json(); // { ventaId, total }
            setMsg(`Venta registrada ✅ ID: ${data.ventaId} — Total: ${data.total}`);
            setCarrito([]);

            // recargar productos para reflejar stock actualizado
            await cargarProductos();
        } catch (e) {
            console.log(e);
            setError("Error conectando con la API al registrar venta.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarProductos();
    }, []);

    return (
        <RequireAuth allowedRoles={["Admin", "Cajero"]}>
            <main style={{ padding: 24, display: "grid", gap: 12, maxWidth: 900 }}>
                <h1>Registrar venta</h1>

                {error && <p style={{ color: "tomato" }}>{error}</p>}
                {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}

                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12, display: "grid", gap: 12 }}>
                    <h3>Productos</h3>

                    {loadingProductos ? (
                        <p>Cargando productos...</p>
                    ) : productos.length === 0 ? (
                        <p>No hay productos activos.</p>
                    ) : (
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                            <label style={{ display: "grid", gap: 6, minWidth: 360 }}>
                                Producto
                                <select
                                    value={productoIdSel}
                                    onChange={(e) => setProductoIdSel(Number(e.target.value))}
                                    style={{ padding: 8 }}
                                >
                                    {productos.map((p) => (
                                        <option key={p.productoId} value={p.productoId}>
                                            {p.nombre} — ${p.precio} — Stock: {p.stock} ({p.categoriaNombre})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={{ display: "grid", gap: 6, width: 160 }}>
                                Cantidad
                                <input
                                    type="number"
                                    value={cantidadSel}
                                    onChange={(e) => setCantidadSel(Number(e.target.value))}
                                    style={{ padding: 8 }}
                                />
                            </label>

                            <button onClick={agregarAlCarrito} style={{ height: 38 }}>
                                Agregar al carrito
                            </button>
                        </div>
                    )}
                </section>

                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
                    <h3>Carrito</h3>

                    {carrito.length === 0 ? (
                        <p>No hay productos agregados.</p>
                    ) : (
                        <>
                            <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {carrito.map((i) => (
                                        <li key={i.productoId} style={{ marginBottom: 8 }}>
                                            <b>{i.nombre}</b> — {i.cantidad} x ${i.precio} = <b>${i.subtotal}</b>{" "}
                                            <button onClick={() => quitarDelCarrito(i.productoId)} style={{ marginLeft: 10 }}>
                                                Quitar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p>
                                Total estimado: <b>${total}</b>
                            </p>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button onClick={registrarVenta} disabled={loading} style={{ width: 200 }}>
                                    {loading ? "Registrando..." : "Registrar venta"}
                                </button>

                                <button onClick={limpiarCarrito} disabled={loading} style={{ width: 200 }}>
                                    Limpiar carrito
                                </button>
                            </div>

                            <p style={{ opacity: 0.85 }}>
                                * Si sale “No hay caja ABIERTA…”, primero abre caja en <b>/caja</b>.
                            </p>
                        </>
                    )}
                </section>
            </main>
        </RequireAuth>
    );
}

