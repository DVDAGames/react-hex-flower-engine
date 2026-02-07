declare module '@dvdagames/js-die-roller' {
  interface RollResult {
    total: number | number[];
    rolls: number[][];
    expression: string;
  }

  interface RollerInstance {
    result: RollResult;
  }

  class Roller {
    constructor(expression: string);
    result: RollResult;
  }

  export default Roller;
}
