"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
    allowedRoles?: string[]; // si no lo pasas, solo exige token
    children: React.ReactNode;
};

export default function RequireAuth({ allowedRoles, children }: Props) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        if (allowedRoles && allowedRoles.length > 0) {
            const rol = localStorage.getItem("rol") ?? "";
            if (!allowedRoles.includes(rol)) {
                router.push("/no-autorizado");
                return;
            }
        }
    }, [router, allowedRoles]);

    return <>{children}</>;
}