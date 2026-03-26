function miFuncion(cadena){
    let arrayLetras=cadena.split("");
    arrayLetras.reverse();
    let cadenaInvertida = arrayLetras.join("");
    return cadenaInvertida;
};
let cad=miFuncion("lupo");
console.log(cad);