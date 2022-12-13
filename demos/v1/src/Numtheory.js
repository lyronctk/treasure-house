// This code is inspired from https://github.com/Zokrates/pycrypto/blob/master/zokrates_pycrypto/field.py

const assert = require('assert');
const BigNumber = require('bignumber.js');
const constants = require('./JubjubConstants.js');

//follow python's % operator
BigNumber.config({ MODULO_MODE: 3 });

class Numtheory {
  static modularExp(base, exponent, modulus=constants.FIELD_MODULUS) {
    let exp = new BigNumber(exponent)
    if(exp.lt(0)) throw new Error("exponet %d should positive");
    let bBase =  new BigNumber(base);
    return bBase.pow(exponent, modulus);
  }

  static polynomialReduceMod(poly, polymod, p) {
    assert.ok(polymod.slice(-1)[0]);
    assert.ok(polymod.length > 1);

    let polyTemp = poly;

    while(polyTemp.length >= polymod.length){
      if(polyTemp.slice(-1)[0] != 0){
        for(let i of [...Array(polymod.length+1).keys()].slice(2)){
          let lastPoly = polyTemp[polyTemp.length-1];
          let polyi = polyTemp[polyTemp.length-i];
          let polymodi = polymod[polymod.length-i];
          polyTemp[polyTemp.length-i] = polyi.minus(lastPoly.times(polymodi)).mod(p);
        }
      }
      polyTemp = polyTemp.slice(0, -1);
    }
    return polyTemp;
  }

  static polynomialMultiplyMod(m1, m2, p) {
    let prod = [...Array(m1.length + m2.length -1)].map(x => new BigNumber(0));
    for(let i of [...Array(m1.length).keys()]){
      for(let j of [...Array(m2.length).keys()]){
        prod[i+j] = prod[i+j].plus(m1[i].times(m2[j])).mod(p);
      }
    }
    return prod;
  }

  static polynomialMulNReduceMod(m1, m2, polymod, p){
    let prod = Numtheory.polynomialMultiplyMod(m1, m2, p);
    let reduced = Numtheory.polynomialReduceMod(prod, polymod, p);
    return reduced;
  }

  static polynomialExpMod(base, exponent, polymod, p){
    assert.ok(exponent.lt(p));
    if(exponent.eq(0)) return [new BigNumber(1)];

    let G = base;
    let k = exponent;
    let s;

    if(k.mod(2).eq(1)){
      s = G;
    } else {
      s = [new BigNumber(1)];
    }

    while(k.gt(1)){
      k = k.idiv(2)
      G = Numtheory.polynomialMulNReduceMod(G, G, polymod, p);
      if(k.mod(2).eq(1)){
        s = Numtheory.polynomialMulNReduceMod(G, s, polymod, p);
      }
    }

    return s;
  }

  static jacobi(a, n) {

    let s;

    let bigA = new BigNumber(a);
    let bigN = new BigNumber(n);

    //check if n is primenumber and bigger then 3
    assert.ok(bigN.gte(3));
    assert.ok(bigN.mod(2).eq(1));

    //a mod n
    let newA = bigA.mod(bigN);

    //if a is  0 or 1, it returns itself
    if(newA.eq(0)) return new BigNumber(0);
    if(newA.eq(1)) return new BigNumber(1);

    let a1 = newA;
    let e = new BigNumber(0);

    while(a1.mod(2).eq(0)){
      a1 = a1.idiv(2);
      e = e.plus(1);
    }

    if(e.mod(2).eq(0) || bigN.mod(8).eq(1) || bigN.mod(8).eq(7)){
      s = new BigNumber(1);
    } else {
      s = new BigNumber(-1);
    }

    if(a1.eq(1)){
      return s;
    }
    if(bigN.mod(4).eq(3) && a1.mod(4).eq(3)){
      s.s = -s.s;
    }
    return s.times(Numtheory.jacobi(bigN.mod(a1), a1));
  }

  static squareRootModPrime(a, p){
    assert.ok(a.gte(0) && a.lt(p));
    assert.ok(p.gt(1));

    if(a.eq(0)) return new BigNumber(0);
    if(p.eq(2)) return a;

    let jac = Numtheory.jacobi(a, p);

    if(jac.eq(-1)){
      throw new Error(a.toFixed()+" has no square root modulo "+p.toFixed());
    }

    if(p.mod(4).eq(3)){
      return Numtheory.modularExp(a, p.plus(1).idiv(4), p);
    }

    if(p.mod(8).eq(5)){
      let d = Numtheory.modularExp(a, p.minus(1).idiv(4), p);
      if(d.eq(1)){
        return Numtheory.modularExp(a, p.plus(3).idiv(8), p);
      }
      if(d.eq(p.minus(1))){
        return new BigNumber(2).times(a).times(Numtheory.modularExp(a.times(4), p.minus(5).idiv(8), p)).mod(p);
      }
      throw new Error("Shouldn't get here.");
    }

    for(var b = new BigNumber(2); b.lt(p); b=b.plus(1)){
      if(Numtheory.jacobi(b.times(b).minus(a.times(4)), p).eq(-1)){
        let f = [a, b.negated(), new BigNumber(1)];
        let base = [0, 1].map(x => new BigNumber(x));
        let ff = Numtheory.polynomialExpMod(base, p.plus(1).idiv(2), f, p)
        assert.ok(ff[1].eq(0));
        return ff[0];
      }
    }
    throw new Error("No b found");
  }
}

function test(){
  //jacobi test
  console.log(Numtheory.jacobi(123, 20003).toFixed()); //1
  console.log(Numtheory.jacobi(1231, 20003).toFixed()); //-1
  console.log(Numtheory.jacobi(12311, 20003).toFixed()); //1

  // Polynomial reduce mod test1
  let poly = new Array(50, 60, 70).map(x => new BigNumber(x));
  let polyMod = new Array(6, -5, 1).map(x => new BigNumber(x));
  let p = new BigNumber(7);
  //should be [1, 4]
  console.log(Numtheory.polynomialReduceMod(poly, polyMod, p).map(x=> x.toFixed()));

  // Polynomial reduce mod test2
  let poly2 = new Array(50, 60, 80).map(x => new BigNumber(x));
  let polyMod2 = new Array(6, -5, 1).map(x => new BigNumber(x));
  let p2 = new BigNumber(7);
  //should be [4, 5]
  console.log(Numtheory.polynomialReduceMod(poly2, polyMod2, p2).map(x=> x.toFixed()));

  // Polynomial multiply test
  let m1 = new Array(1, 2, 3).map(x => new BigNumber(x));
  let m2 = new Array(3, 4, 5).map(x => new BigNumber(x));
  let pMulty = new BigNumber(7);
  //should be [3, 3, 1, 1, 1]
  console.log(Numtheory.polynomialMultiplyMod(m1, m2, pMulty).map(x=> x.toFixed()));

  //polynomial Multiply and Reduce test
  let polyMod3 =  new Array(6, 7, 1).map(x => new BigNumber(x));
  //should be [5, 4]
  console.log(Numtheory.polynomialMulNReduceMod(m1, m2, polyMod3, pMulty).map(x=> x.toFixed()));

  //polynomial exp test
  let base = [0, 1].map(x => new BigNumber(x));
  let exp = new BigNumber(9);
  let pMod = [6, 7, 1].map(x => new BigNumber(x));
  let pExp = new BigNumber(11);
  //should be [8,9]
  console.log(Numtheory.polynomialExpMod(base, exp, pMod, pExp).map(x=> x.toFixed()));

  //square root mod prime test1
  let a1 = new BigNumber(25);
  let pSquareRootMod = new BigNumber(91);
  //should be 51
  console.log(Numtheory.squareRootModPrime(a1, pSquareRootMod).toFixed());

  //square root mod prime test2
  let a2 = new BigNumber(26);
  //should be 52
  console.log(Numtheory.squareRootModPrime(a2, pSquareRootMod).toFixed());

  //square root mod prime test2
  let a3 = new BigNumber(27);
  //should throw an error
  console.log(Numtheory.squareRootModPrime(a3, pSquareRootMod).toFixed());
}

//test();

module.exports = {
  Numtheory,
}
