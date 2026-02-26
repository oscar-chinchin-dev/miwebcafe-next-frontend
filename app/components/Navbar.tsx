"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type UserInfo = {
    nombre: string;
    rol: string;
    token: string;
};

function isActive(pathname: string, href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token") ?? "";
        const nombre = localStorage.getItem("nombre") ?? "";
        const rol = localStorage.getItem("rol") ?? "";

        if (!token) {
            setUser(null);
            return;
        }
        setUser({ token, nombre, rol });
    }, [pathname]);

    const links = useMemo(() => {
        if (!user) return [];

        const base = [
            { href: "/caja", label: "Caja", roles: ["Admin", "Cajero"] },
            { href: "/ventas", label: "Ventas", roles: ["Admin", "Cajero"] },
        ];

        const adminOnly = [
            { href: "/ventas-admin", label: "Ventas (Admin)", roles: ["Admin"] },
            { href: "/reportes", label: "Reportes", roles: ["Admin"] },
            { href: "/cierres-admin", label: "Cierres", roles: ["Admin"] },
        ];

        const all = [...base, ...adminOnly];
        return all.filter((l) => l.roles.includes(user.rol));
    }, [user]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");
        localStorage.removeItem("rol");
        router.push("/login");
    }

    // Oculta navbar en login / no autorizado
    const hideOn = ["/login", "/no-autorizado"];
    if (hideOn.includes(pathname)) return null;

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                backdropFilter: "blur(10px)",
                background: "rgba(0,0,0,0.65)",
                borderBottom: "1px solid #222",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <Link
                    href="/"
                    style={{
                        fontWeight: 800,
                        letterSpacing: 0.2,
                        textDecoration: "none",
                        color: "white",
                        paddingRight: 6,
                    }}
                >
                    MiWebCafe
                </Link>

                <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {links.map((l) => {
                        const active = isActive(pathname, l.href);
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                style={{
                                    textDecoration: "none",
                                    color: active ? "white" : "rgba(255,255,255,0.78)",
                                    border: active ? "1px solid #333" : "1px solid transparent",
                                    background: active ? "rgba(255,255,255,0.06)" : "transparent",
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    transition: "all 120ms ease",
                                }}
                            >
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                    {user ? (
                        <>
                            <div style={{ textAlign: "right", lineHeight: 1.2 }}>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                                    {user.nombre || "Usuario"}
                                </div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                                    Rol: {user.rol || "—"}
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                style={{
                                    border: "1px solid #333",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "white",
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    cursor: "pointer",
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            style={{
                                textDecoration: "none",
                                color: "white",
                                border: "1px solid #333",
                                background: "rgba(255,255,255,0.06)",
                                padding: "8px 10px",
                                borderRadius: 10,
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
