const pool = require('../config/db');

class Stats {
    static async obtenerEstadisticasDashboard() {
        // Ejecutamos múltiples consultas de agregación en paralelo
        const [
            resConteos,
            resFinanzasContratos,
            resPolizasPorVencer,
            resSiniestrosAgrupados,
            resDistribucionAseguradoras
        ] = await Promise.all([
            
            // 1. Conteos generales básicos
            pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM cliente WHERE is_active = true) as total_clientes,
                    (SELECT COUNT(*) FROM contrato_servicios WHERE is_active = true) as total_contratos,
                    (SELECT COUNT(*) FROM poliza_seguro WHERE is_active = true) as total_polizas,
                    (SELECT COUNT(*) FROM siniestro WHERE is_active = true) as total_siniestros
            `),

            // 2. Suma del valor total de los contratos activos
            pool.query(`
                SELECT COALESCE(SUM(importe), 0) as total_monto_contratos 
                FROM contrato_servicios 
                WHERE is_active = true
            `),

            // 3. Pólizas que vencen en los próximos 30 días
            pool.query(`
                SELECT COUNT(*) as polizas_por_vencer 
                FROM poliza_seguro 
                WHERE is_active = true 
                  AND fin_vigencia BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
            `),

            // 4. Resumen de siniestros agrupados por estado
            pool.query(`
                SELECT 
                    estado,
                    COUNT(*) as cantidad,
                    COALESCE(SUM(monto_reclamado), 0) as total_reclamado,
                    COALESCE(SUM(monto_indemnizado), 0) as total_indemnizado
                FROM siniestro
                WHERE is_active = true
                GROUP BY estado
            `),

            // 5. Cantidad de pólizas por aseguradora
            pool.query(`
                SELECT a.nombre as aseguradora, COUNT(p.id_poliza) as cantidad
                FROM poliza_seguro p
                JOIN aseguradora a ON p.id_aseguradora = a.id_aseguradora
                WHERE p.is_active = true
                GROUP BY a.nombre
                ORDER BY cantidad DESC
            `)
        ]);

        // El modelo devuelve la data ya procesada y lista para ser consumida
        return {
            resumenGeneral: {
                ...resConteos.rows[0],
                total_monto_contratos: parseFloat(resFinanzasContratos.rows[0].total_monto_contratos),
                polizas_por_vencer: parseInt(resPolizasPorVencer.rows[0].polizas_por_vencer, 10)
            },
            siniestrosPorEstado: resSiniestrosAgrupados.rows,
            distribucionAseguradoras: resDistribucionAseguradoras.rows
        };
    }
}

module.exports = Stats;