// Funciones
const crearPedido = () => Promise.resolve("Pedido #101");
const procesarPago = (pedido) => Promise.resolve(`Pago de ${pedido} realizado`);
const confirmarEnvio = (pago) => Promise.resolve(`${pago} - Envío en camino`);

//EJEMPLO DE ANIDAMIENTO DE PROMESAS
console.log('Ejemplo Anidamiento de Promesas');
crearPedido().then((pedido) => {
    procesarPago(pedido).then((pago) => {
        confirmarEnvio(pago).then((confirmacion) => {
            console.log("Resultado final:", confirmacion);
        });
    });
});

// EJEMPLO DE ASYNC / AWAIT
async function gestionarCompra() {
    
    try {
        const pedido = await crearPedido();
        const pago = await procesarPago(pedido);
        const confirmacion = await confirmarEnvio(pago);
        console.log('Ejemplo Async/Await');
        console.log("Resultado final:", confirmacion);
    } catch (error) {
        console.error("Error en la compra:", error);
    }
}

gestionarCompra();