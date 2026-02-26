export type VentaListado = {
    ventaId: number;
    fecha: string;
    total: number;
    cajero: string;
};

export type ReporteRango = {
    desde: string;
    hasta: string;
    cantidadVentas: number;
    totalVendido: number;
    ventas: VentaListado[];
};