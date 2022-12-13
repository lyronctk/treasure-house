// This code is inspired from https://github.com/Zokrates/pycrypto/blob/master/zokrates_pycrypto/field.py

const assert = require('assert');
const BigNumber = require('bignumber.js');

//follow python's % operator
BigNumber.config({ MODULO_MODE: 3 });

const constants = require('./JubjubConstants.js');

class FQ {
  constructor(val, modulus=constants.FIELD_MODULUS){
    if(val instanceof FQ){
      this.n = val.n;
    } else {
      let bigValue = new BigNumber(val);
      this.n = bigValue.mod(modulus);
      if(bigValue.eq(modulus)){
        this.n = modulus;
      }
    }
    this.modulus = modulus;
  }

  add(addedVal){
    let addend;
    if(addedVal instanceof FQ){
      addend = addedVal.n;
    } else {
      addend = new BigNumber(addedVal);
    }

    return new FQ(this.n.plus(addend).mod(this.modulus));
  }

  mul(multipliedVal){
    let multiplier;
    if(multipliedVal instanceof FQ){
      multiplier = multipliedVal.n;
    } else {
      multiplier = new BigNumber(multipliedVal);
    }

    return new FQ(this.n.times(multiplier).mod(this.modulus));
  }

  sub(subVal){
    let subtrahend;
    if(subVal instanceof FQ){
      subtrahend = subVal.n;
    } else {
      subtrahend = new BigNumber(subVal);
    }
    return new FQ(this.n.minus(subtrahend).mod(this.modulus));
  }

  div(divVal){
    let divisor;
    if(divVal instanceof FQ){
      divisor = divVal.n;
    } else {
      divisor = new BigNumber(divisor);
    }
    return new FQ(this.n.times(_inv(divVal.n, this.modulus)).mod(this.modulus));
  }

  nega() {
    return new FQ(this.n.negated());
  }

  equal(field){
    assert(field instanceof FQ, "params should be FQ");
    return this.n.eq(field.n);
  }

  // Extended euclidean algorithm to find modular inverses for integers
  static _inv(a, n){
    //check if "a" and "n" is bignumber object
    assert(a instanceof BigNumber && n instanceof BigNumber);
    if(a.eq('0')){
      return new BigNumber('0');
    }
    let lm = new BigNumber('1');
    let hm = new BigNumber('0');

    let low = a.mod(n)
    let high = n;

    while(low > 1){
      let r = high.idiv(low);
      let nm = hm.minus(lm.times(r));
      let newV = high.minus(low.times(r));
      // console.log("r, nm, newV", r.toNumber(), nm.toNumber(), newV.toNumber());

      let tempLm = lm;
      let tempLow = low;

      lm = nm;
      low = newV;
      hm = tempLm;
      high = tempLow;
    }
    // console.log("last lm, n", lm.toNumber(), n.toNumber());
    return lm.mod(n);
  }

}

class FR extends FQ {
  constructor(val, FR_ORDER=constants.FR_ORDER){
    super(val, FR_ORDER);
  }
}

// Extended euclidean algorithm to find modular inverses for integers
function _inv(a, n){
  //check if "a" and "n" is bignumber object
  assert(a instanceof BigNumber && n instanceof BigNumber);
  if(a.eq('0')){
    return new BigNumber('0');
  }
  let lm = new BigNumber('1');
  let hm = new BigNumber('0');

  let low = a.mod(n)
  let high = n;

  while(low > 1){
    let r = high.idiv(low);
    let nm = hm.minus(lm.times(r));
    let newV = high.minus(low.times(r));
    // console.log("r, nm, newV", r.toNumber(), nm.toNumber(), newV.toNumber());

    let tempLm = lm;
    let tempLow = low;

    lm = nm;
    low = newV;
    hm = tempLm;
    high = tempLow;
  }
  // console.log("last lm, n", lm.toNumber(), n.toNumber());
  return lm.mod(n);
}


module.exports = {
  FQ,
  FR,
  _inv,
}
