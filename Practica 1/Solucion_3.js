function miFuncion(arreglo){
    let resultado={
         pares:[],
         impares:[]
    }
    for (let numero of arreglo) {
        if ( numero%2 === 0 ){
            resultado.pares.push(numero);
        }
        else{
            resultado.impares.push(numero);
        }
    }
    return resultado;
};
let miArreglo=[3,4,5,6,7];
let obj=miFuncion(miArreglo);
console.log(obj);