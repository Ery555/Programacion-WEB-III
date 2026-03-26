function miFuncion(cadena){
    let arreglo1=cadena.split('');
    let arreglo2=arreglo1.reverse();
    let valor=true;
    for (let i = 0; i < cadena.lenght; i++) {
        if(arreglo1[i]!=arreglo2[i]){
            valor=false;
        }
    }
    return valor;
}
let band= miFuncion("sopa");
console.log(band);