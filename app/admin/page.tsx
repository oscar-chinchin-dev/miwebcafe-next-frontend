"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import { api } from "../lib/api";

type CategoriaDto = {
    categoriaId: number;
    nombre: string;
    activa: boolean;
};

type ProductoDto = {
    productoId: number;
    nombre: string;
    precio: number;
    stock: number;
    categoriaId: number;
    categoriaNombre?: string;
    activo: boolean;
};

function token() {
    return localStorage.getItem("token") ?? "";
}

export default function AdminPage() {
    // --- Categorías ---
    const [categorias, setCategorias] = useState<CategoriaDto[]>([]);
    const [catNombre, setCatNombre] = useState("");
    const [catActiva, setCatActiva] = useState(true);
    const [catEditId, setCatEditId] = useState<number | null>(null);

    // --- Productos ---
    const [productos, setProductos] = useState<ProductoDto[]>([]);
    const [prodNombre, setProdNombre] = useState("");
    const [prodPrecio, setProdPrecio] = useState<number>(0);
    const [prodStock, setProdStock] = useState<number>(0);
    const [prodCategoriaId, setProdCategoriaId] = useState<number>(0);
    const [prodActivo, setProdActivo] = useState(true);
    const [prodEditId, setProdEditId] = useState<number | null>(null);

    // UI
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const categoriasActivas = useMemo(
        () => categorias.filter((c) => c.activa),
        [categorias]
    );

    async function cargarCategorias() {
        const res = await fetch(api("/api/categorias"), {
            headers: { Authorization: `Bearer ${token()}` },
        });

        if (!res.ok) throw new Error(await res.text().catch(() => "Error cargando categorías"));
        const data = (await res.json()) as CategoriaDto[];
        setCategorias(data);

        // set default en select de producto
        if (data.length > 0 && prodCategoriaId === 0) setProdCategoriaId(data[0].categoriaId);
    }

    async function cargarProductos() {
        const res = await fetch(api("/api/productos"), {
            headers: { Authorization: `Bearer ${token()}` },
        });

        if (!res.ok) throw new Error(await res.text().catch(() => "Error cargando productos"));
        const data = (await res.json()) as ProductoDto[];
        setProductos(data);
    }

    async function cargarTodo() {
        setError(null);
        setMsg(null);
        setLoading(true);
        try {
            await Promise.all([cargarCategorias(), cargarProductos()]);
        } catch (e: any) {
            setError(e?.message ?? "Error cargando datos.");
        } finally {
            setLoading(false);
        }
    }

    // ------------------- CATEGORÍAS -------------------
    function resetCategoriaForm() {
        setCatNombre("");
        setCatActiva(true);
        setCatEditId(null);
    }

    async function guardarCategoria() {
        setError(null);
        setMsg(null);

        if (!catNombre.trim()) {
            setError("El nombre de la categoría es obligatorio.");
            return;
        }

        setLoading(true);
        try {
            const isEdit = catEditId != null;
            const url = isEdit ? api(`/api/categorias/${catEditId}`) : api("/api/categorias");
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({ nombre: catNombre.trim(), activa: catActiva }),
            });

            if (!res.ok) throw new Error(await res.text().catch(() => "No se pudo guardar categoría"));

            setMsg(isEdit ? "Categoría actualizada ✅" : "Categoría creada ✅");
            resetCategoriaForm();
            await cargarCategorias();
        } catch (e: any) {
            setError(e?.message ?? "Error guardando categoría.");
        } finally {
            setLoading(false);
        }
    }

    function editarCategoria(c: CategoriaDto) {
        setCatEditId(c.categoriaId);
        setCatNombre(c.nombre);
        setCatActiva(c.activa);
        setMsg(null);
        setError(null);
    }

    async function eliminarCategoria(id: number) {
        if (!confirm("¿Eliminar categoría?")) return;
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            const res = await fetch(api(`/api/categorias/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });

            if (!res.ok) throw new Error(await res.text().catch(() => "No se pudo eliminar categoría"));

            setMsg("Categoría eliminada ✅");
            await cargarCategorias();
        } catch (e: any) {
            setError(e?.message ?? "Error eliminando categoría.");
        } finally {
            setLoading(false);
        }
    }

    // ------------------- PRODUCTOS -------------------
    function resetProductoForm() {
        setProdNombre("");
        setProdPrecio(0);
        setProdStock(0);
        setProdActivo(true);
        setProdEditId(null);

        // mantiene una categoría válida seleccionada
        if (categorias.length > 0) setProdCategoriaId(categorias[0].categoriaId);
    }

    async function guardarProducto() {
        setError(null);
        setMsg(null);

        if (!prodNombre.trim()) return setError("El nombre del producto es obligatorio.");
        if (prodPrecio <= 0) return setError("El precio debe ser mayor a 0.");
        if (prodStock < 0) return setError("El stock no puede ser negativo.");
        if (!prodCategoriaId) return setError("Selecciona una categoría.");

        setLoading(true);
        try {
            const isEdit = prodEditId != null;
            const url = isEdit ? api(`/api/productos/${prodEditId}`) : api("/api/productos");
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token()}`,
                },
                body: JSON.stringify({
                    nombre: prodNombre.trim(),
                    precio: prodPrecio,
                    stock: prodStock,
                    categoriaId: prodCategoriaId,
                    activo: prodActivo,
                }),
            });

            if (!res.ok) throw new Error(await res.text().catch(() => "No se pudo guardar producto"));

            setMsg(isEdit ? "Producto actualizado ✅" : "Producto creado ✅");
            resetProductoForm();
            await cargarProductos();
        } catch (e: any) {
            setError(e?.message ?? "Error guardando producto.");
        } finally {
            setLoading(false);
        }
    }

    function editarProducto(p: ProductoDto) {
        setProdEditId(p.productoId);
        setProdNombre(p.nombre);
        setProdPrecio(p.precio);
        setProdStock(p.stock);
        setProdCategoriaId(p.categoriaId);
        setProdActivo(p.activo);
        setMsg(null);
        setError(null);
    }

    async function eliminarProducto(id: number) {
        if (!confirm("¿Eliminar producto?")) return;
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            const res = await fetch(api(`/api/productos/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });

            if (!res.ok) throw new Error(await res.text().catch(() => "No se pudo eliminar producto"));

            setMsg("Producto eliminado ✅");
            await cargarProductos();
        } catch (e: any) {
            setError(e?.message ?? "Error eliminando producto.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarTodo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <RequireAuth allowedRoles={["Admin"]}>
            <main style={{ padding: 24, display: "grid", gap: 16, maxWidth: 1100 }}>
                <h1>Panel Admin</h1>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={cargarTodo} disabled={loading} style={{ width: 160 }}>
                        {loading ? "Cargando..." : "Actualizar"}
                    </button>
                </div>

                {error && <p style={{ color: "tomato" }}>{error}</p>}
                {msg && <p style={{ color: "lightgreen" }}>{msg}</p>}

                {/* CATEGORÍAS */}
                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                    <h3>Categorías</h3>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                        <label style={{ display: "grid", gap: 6, minWidth: 360 }}>
                            Nombre
                            <input
                                value={catNombre}
                                onChange={(e) => setCatNombre(e.target.value)}
                                placeholder="Ej: Cafés"
                                style={{ padding: 8 }}
                            />
                        </label>

                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={catActiva}
                                onChange={(e) => setCatActiva(e.target.checked)}
                            />
                            Activa
                        </label>

                        <button onClick={guardarCategoria} disabled={loading} style={{ height: 38, width: 140 }}>
                            {catEditId ? "Guardar" : "Crear"}
                        </button>

                        {catEditId && (
                            <button onClick={resetCategoriaForm} disabled={loading} style={{ height: 38, width: 140 }}>
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: 12, border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        {categorias.length === 0 ? (
                            <p>No hay categorías.</p>
                        ) : (
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {categorias.map((c) => (
                                    <li key={c.categoriaId} style={{ marginBottom: 8 }}>
                                        <b>{c.nombre}</b> — {c.activa ? "Activa" : "Inactiva"}{" "}
                                        <button onClick={() => editarCategoria(c)} style={{ marginLeft: 10 }}>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarCategoria(c.categoriaId)}
                                            style={{ marginLeft: 8, color: "tomato" }}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                {/* PRODUCTOS */}
                <section style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                    <h3>Productos</h3>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
                        <label style={{ display: "grid", gap: 6, minWidth: 360 }}>
                            Nombre
                            <input
                                value={prodNombre}
                                onChange={(e) => setProdNombre(e.target.value)}
                                placeholder="Ej: Capuccino"
                                style={{ padding: 8 }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6, width: 160 }}>
                            Precio
                            <input
                                type="number"
                                value={prodPrecio}
                                onChange={(e) => setProdPrecio(Number(e.target.value))}
                                placeholder="Ej: 2500"
                                style={{ padding: 8 }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6, width: 160 }}>
                            Stock
                            <input
                                type="number"
                                value={prodStock}
                                onChange={(e) => setProdStock(Number(e.target.value))}
                                style={{ padding: 8 }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6, minWidth: 240 }}>
                            Categoría
                            <select
                                value={prodCategoriaId}
                                onChange={(e) => setProdCategoriaId(Number(e.target.value))}
                                style={{ padding: 8 }}
                            >
                                {categorias.map((c) => (
                                    <option key={c.categoriaId} value={c.categoriaId}>
                                        {c.nombre} {c.activa ? "" : "(inactiva)"}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="checkbox"
                                checked={prodActivo}
                                onChange={(e) => setProdActivo(e.target.checked)}
                            />
                            Activo
                        </label>

                        <button onClick={guardarProducto} disabled={loading} style={{ height: 38, width: 140 }}>
                            {prodEditId ? "Guardar" : "Crear"}
                        </button>

                        {prodEditId && (
                            <button onClick={resetProductoForm} disabled={loading} style={{ height: 38, width: 140 }}>
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: 12, border: "1px solid #333", borderRadius: 10, padding: 12 }}>
                        {productos.length === 0 ? (
                            <p>No hay productos.</p>
                        ) : (
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {productos.map((p) => (
                                    <li key={p.productoId} style={{ marginBottom: 8 }}>
                                        <b>{p.nombre}</b> — ${p.precio} — Stock: {p.stock} — CatID: {p.categoriaId} —{" "}
                                        {p.activo ? "Activo" : "Inactivo"}{" "}
                                        <button onClick={() => editarProducto(p)} style={{ marginLeft: 10 }}>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarProducto(p.productoId)}
                                            style={{ marginLeft: 8, color: "tomato" }}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <p style={{ opacity: 0.8, marginTop: 10 }}>
                        Nota: primero crea categorías, luego productos (por FK CategoriaId).
                    </p>
                </section>
            </main>
        </RequireAuth>
    );
}