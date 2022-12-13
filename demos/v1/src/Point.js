// This code is inspired from
// https://github.com/Zokrates/pycrypto/blob/master/zokrates_pycrypto/babyjubjub.py
// and
// https://github.com/Zokrates/ZoKrates/tree/master/zokrates_stdlib/stdlib/ecc

const assert = require('assert');
const BigNumber = require('bignumber.js');
const { FQ } = require('./Field');
const constants = require('./JubjubConstants.js');
const { Numtheory } = require('./Numtheory.js');

//follow python's % operator
BigNumber.config({ MODULO_MODE: 3 })

class Point {
  constructor(pointX, pointY){
    this.x = new FQ(pointX);
    this.y = new FQ(pointY);

    //Jubjub variables
    this.JUBJUB_Q = new FQ(constants.JUBJUB_Q);
    this.JUBJUB_E = new FQ(constants.JUBJUB_E);
    this.JUBJUB_C = new FQ(constants.JUBJUB_C);
    this.JUBJUB_L = new FQ(constants.JUBJUB_L);
    this.JUBJUB_A = new FQ(constants.JUBJUB_A);
    this.JUBJUB_D = new FQ(constants.JUBJUB_D);

    this.one = new FQ(1);
    this.zero = new FQ(0);
  }

  isValid() {
    //Satisfies the relationship
    //ax^2 + y^2 = 1 + d x^2 y^2
    let xsq = this.x.mul(this.x);
    let ysq = this.y.mul(this.y);

    let left_expression = this.JUBJUB_A.mul(xsq).add(ysq);
    let right_expression = this.one.add(this.JUBJUB_D.mul(xsq).mul(ysq));

    // console.log(left_expression == right_expression);
    return left_expression.n.eq(right_expression.n);
  }

  add(addendPoint) {
    assert(addendPoint instanceof Point);
    if(this.x.n.eq(0) && this.y.n.eq(0)){
      return addendPoint;
    }

    let u1 = this.x;
    let v1 = this.y;

    let u2 = addendPoint.x;
    let v2 = addendPoint.y;

    //u3 = (u1 * u2 + v1 * v2) / (1 + D * u1 * u2 * v1 * v2)
    let u3_molecular = u1.mul(v2).add(v1.mul(u2))
    let u3_denominator = this.one.add(this.JUBJUB_D.mul(u1).mul(u2).mul(v1).mul(v2));
    let u3 = u3_molecular.div(u3_denominator);

    //v3 = (v1 * v2 - A * u1 * u2) / (1 - D * u1 * u2 * v1 * v2)
    let v3_molecular = v1.mul(v2).sub(this.JUBJUB_A.mul(u1).mul(u2));
    let v3_denominator = this.one.sub(this.JUBJUB_D.mul(u1).mul(u2).mul(v1).mul(v2))
    let v3 = v3_molecular.div(v3_denominator);

    return new Point(u3, v3);
  }

  mult(scalar) {
    if(scalar instanceof FQ){
      scalar = scalar.n;
    } else {
      scalar = new BigNumber(scalar);
    }
    // console.log("scalar : ", scalar);

    let p = this;
    let a = Point.infinity();

    // console.log("before p.x, p.y : ", p.x.n.toFixed(), p.y.n.toFixed());
    // console.log("before a.x, a.y : ", a.x.n.toFixed(), a.y.n.toFixed());

    while(!scalar.eq(0)) {
      //if scalar is odd number
      //TODO : Find more efficient way
      if(scalar.mod(2).eq(1)) {
        a = a.add(p);
      }
      p = p.double();
      //scalar shifts right
      scalar = scalar.idiv(2);
    }
    return a;
  }

  neg() {
    return new Point(this.x.nega(), this.y);
  }

  static generator() {
    let gX = '16540640123574156134436876038791482806971768689494387082833631921987005038935';
    let gY = '20819045374670962167435360035096875258406992893633759881276124905556507972311';
    // console.log('generated!!');
    return new Point(gX, gY);
  }

  static infinity() {
    return new Point(new FQ(0), new FQ(1));
  }

  double() {
    return this.add(this);
  }

  isEqualTo(point) {
    assert(point instanceof Point, "point should be Point");
    if(this.x.equal(point.x) && this.y.equal(point.y)){
      return true;
    } else{
      return false;
    }
  }

  // y^2 = ((a * x^2) / (d * x^2 - 1)) - (1 / (d * x^2 - 1))
  // For every x coordinate, there are two possible points: (x, y) and (x, -y)
  static fromX(x){
    assert.ok(x instanceof FQ, "params should be FQ");

    let fqA = new FQ(constants.JUBJUB_A);
    let fqD = new FQ(constants.JUBJUB_D);
    let fqQ = new FQ(constants.JUBJUB_Q);
    let fqOne = new FQ(1);

    let xsq = x.mul(x);
    let ax2 = fqA.mul(xsq);
    let dxsqm1 = new FQ(FQ._inv(fqD.mul(xsq).sub(fqOne).n, fqQ.n));
    let ysq = dxsqm1.mul(ax2.sub(fqOne));
    let y = new FQ(Numtheory.squareRootModPrime(ysq.n, fqQ.n));
    return new Point(x, y);
  }

  // x^2 = (y^2 - 1) / (d * y^2 - a)
  static fromY(y){
    assert.ok(y instanceof FQ, "params should be FQ");

    let fqA = new FQ(constants.JUBJUB_A);
    let fqD = new FQ(constants.JUBJUB_D);
    let fqQ = new FQ(constants.JUBJUB_Q);
    let fqOne = new FQ(1);

    let ysq = y.mul(y);
    let lhs = ysq.sub(fqOne);
    //console.log("lhs : ", lhs.n.toFixed());
    let rhs = fqD.mul(ysq).sub(fqA);
    //console.log("rhs : ", rhs.n.toFixed());
    let xsq = lhs.div(rhs);
    //console.log("xsq : ", xsq.n.toFixed());
    let x = new FQ(Numtheory.squareRootModPrime(xsq.n, fqQ.n));
    //console.log("x : ", x.n.toFixed());

    if(x.n.isNegative()){
      x = new FQ(x.n.negated());
    }
    return new Point(x, y);
  }

  static fieldToPoint(value){
    let valueX;
    let targetPoint;
    let counter = new BigNumber(0);

    if(value instanceof FQ){
      valueX = value;
    } else {
      valueX = new FQ(value);
    }

    while(true){
      try {
        targetPoint = Point.fromX(valueX);
      } catch(error) {
        counter = counter.plus(1);
        //console.log("Counter : ", counter);
        //console.log(error);
        valueX = valueX.add(new FQ(1));
        continue;
      }
      return {
        point : targetPoint,
        added : counter
      };
    }
  }
}

module.exports = {
  Point,
}
