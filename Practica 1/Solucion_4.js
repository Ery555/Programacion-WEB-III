function miFuncion(arreglo){
    let mayor,menor;
    mayor = arreglo[0];
    for (let i = 0; i < arreglo.length; i++) {
        if(arreglo[i]>=mayor)mayor = arreglo[i];
    }
    menor = arreglo[0];
    for (let i = 0; i < arreglo.length; i++) {
        if(arreglo[i]<=menor) menor = arreglo[i];
    }
    let resultado={
        mayor:mayor,
        menor:menor
    }
    return resultado;
}
const miArreglo=[2,3,7,4,9];
let obj=miFuncion(miArreglo);
console.log(obj);