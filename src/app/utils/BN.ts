import BigNumber from "bignumber.js";
import { Undefinable } from "tsdef";

BigNumber.config({ EXPONENTIAL_AT: [-100, 100] });

type TValue = BN | BigNumber.Value;

interface IBN extends BigNumber {
  sub(n: TValue, base?: number): BN;
  mul(n: TValue, base?: number): BN;
  neg(): BN;
  add(n: TValue, base?: number): BN;
}

const bigNumberify = (n: any): string | number => {
  if (n && n.toString) {
    const primitive = n.toString();

    if (typeof primitive !== "object") {
      return primitive;
    }
  }

  return n;
};

class BN extends BigNumber implements IBN {
  static ZERO = new BN(0);
  static MaxUint256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  dividedBy = this.div;
  exponentiatedBy = this.pow;
  modulo = this.mod;
  multipliedBy = this.mul;
  squareRoot = this.sqrt;
  plus = this.add;
  minus = this.sub;

  constructor(n: TValue, base?: number) {
    super(bigNumberify(n), base);
  }

  static clamp(number: TValue, min: TValue, max: TValue): BN {
    return BN.min(BN.max(number, min), max);
  }

  static max(...n: TValue[]): BN {
    return new BN(super.max(...n.map(bigNumberify)));
  }

  static min(...n: TValue[]): BN {
    return new BN(super.min(...n.map(bigNumberify)));
  }

  static toBN(p: Promise<number | string>): Promise<BN> {
    return p.then((v) => new BN(v));
  }

  static parseUnits(value: TValue, decimals: number): BN {
    return new BN(new BN(10).pow(decimals).times(bigNumberify(value)));
  }

  static formatUnits(value: TValue, decimals = 9): BN {
    return new BN(value).div(new BN(10).pow(decimals));
  }

  static percentOf(value: TValue, percent: TValue): BN {
    return new BN(new BN(value).times(percent).div(100).toFixed(0));
  }

  static ratioOf(valueA: TValue, valueB: TValue): BN {
    return new BN(valueA).div(valueB).times(100) as BN;
  }

  abs(): BN {
    return new BN(super.abs());
  }

  div(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.div(bigNumberify(n), base));
  }

  pow(n: TValue, m?: Undefinable<TValue>): BN {
    return new BN(super.pow(bigNumberify(n), bigNumberify(m)));
  }

  sub(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.minus(bigNumberify(n), base));
  }

  mod(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.mod(bigNumberify(n), base));
  }

  mul(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.times(bigNumberify(n), base));
  }

  neg(): BN {
    return new BN(super.negated());
  }

  add(n: TValue, base?: Undefinable<number>): BN {
    return new BN(super.plus(bigNumberify(n), base));
  }

  sqrt(): BN {
    return new BN(super.sqrt());
  }

  toDecimalPlaces(decimalPlaces: number, roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN): BN {
    return new BN(super.dp(decimalPlaces, roundingMode));
  }

  toBigFormat(decimalPlaces: number): string {
    if (super.toNumber() > 999 && super.toNumber() < 1000000) {
      return (super.toNumber() / 1000).toFixed(1) + "K";
    } else if (super.toNumber() > 1000000) {
      return (super.toNumber() / 1000000).toFixed(1) + "M";
    } else if (super.toNumber() < 900) {
      return super.toFormat(decimalPlaces); // if value < 1000, nothing to do
    }
    return super.toFormat(decimalPlaces);
  }

  /**
   * @example
   * new BN('1234.5678').toSignificant(2) === 1,234.56
   * new BN('1234.506').toSignificant(2) === 1,234.5
   * new BN('123.0000').toSignificant(2) === 123
   * new BN('0.001234').toSignificant(2) === 0.0012
   */
  toSignificant = (
    significantDigits: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
    format?: BigNumber.Format,
  ): string => {
    return this.abs().gte(1) || significantDigits === 0
      ? this.toFormat(significantDigits, roundingMode, format).replace(/(\.[0-9]*[1-9])0+$|\.0+$/, "$1")
      : super.precision(significantDigits, roundingMode).toString();
  };

  clamp(min: TValue, max: TValue): BN {
    return BN.min(BN.max(this, min), max);
  }


}

export default BN;