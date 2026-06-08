import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clienteAxios from '../api/axios';

// 1. Añadimos alertasContratos como segundo parámetro
export const generarReporteGerencial = async (alertasPolizas, alertasContratos) => {
    // Obtenemos los siniestros
    const resSiniestros = await clienteAxios.get('/siniestros');
    const ultimosSiniestros = resSiniestros.data.slice(0, 5);

    const doc = new jsPDF();

    // Cabecera Institucional
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Reporte Ejecutivo de Seguros", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Generado por: Sistema de Gestión`, 14, 34);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 38, 196, 38);

    // --- TABLA 1: PÓLIZAS CRÍTICAS ---
    doc.setFontSize(14);
    doc.setTextColor(220, 53, 69); // Rojo
    doc.text("1. Alerta: Pólizas a vencer en los próximos 30 días", 14, 50);

    const polizasBody = alertasPolizas.map(p => [
        p.numero_codigo_poliza, 
        p.cliente_nombre, 
        p.aseguradora_nombre, 
        p.fin_vigencia.substring(0, 10)
    ]);

    autoTable(doc, {
        startY: 55,
        head: [['Código de Póliza', 'Cliente', 'Aseguradora', 'Vencimiento']],
        body: polizasBody.length > 0 ? polizasBody : [['', 'No hay pólizas por vencer', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69] }, 
        styles: { fontSize: 9 }
    });

    // --- TABLA 2: CONTRATOS CRÍTICOS (NUEVO) ---
    // Calculamos dónde terminó la tabla 1
    let finalY = doc.lastAutoTable.finalY || 55;

    doc.setFontSize(14);
    doc.setTextColor(253, 126, 20); // Naranja
    doc.text("2. Alerta: Contratos a vencer en los próximos 30 días", 14, finalY + 15);

    const contratosBody = alertasContratos.map(c => [
        c.codigo,
        c.cliente_nombre,
        `Bs. ${c.importe}`,
        c.fecha_fin.substring(0, 10)
    ]);

    autoTable(doc, {
        startY: finalY + 20,
        head: [['Código de Contrato', 'Cliente', 'Importe', 'Vencimiento']],
        body: contratosBody.length > 0 ? contratosBody : [['', 'No hay contratos por vencer', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [253, 126, 20] }, 
        styles: { fontSize: 9 }
    });

    // --- TABLA 3: SINIESTROS ---
    // Calculamos dónde terminó la tabla 2
    finalY = doc.lastAutoTable.finalY || finalY + 20;

    doc.setFontSize(14);
    doc.setTextColor(0, 123, 255); // Azul
    doc.text("3. Registro de Siniestros Recientes", 14, finalY + 15);

    const siniestrosBody = ultimosSiniestros.map(s => [
        s.cliente_nombre,
        s.tipo_bien.toUpperCase(),
        s.estado.toUpperCase(),
        `Bs. ${s.monto_reclamado}`,
        s.fecha_ocurrencia.substring(0, 10)
    ]);

    autoTable(doc, {
        startY: finalY + 20,
        head: [['Asegurado', 'Bien Afectado', 'Estado Actual', 'Monto Reclamado', 'Fecha Accidente']],
        body: siniestrosBody.length > 0 ? siniestrosBody : [['', 'No hay siniestros registrados', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] }, 
        styles: { fontSize: 9 }
    });

    // Descargar el archivo
    doc.save(`Reporte_Gerencial_${new Date().toISOString().substring(0,10)}.pdf`);
};