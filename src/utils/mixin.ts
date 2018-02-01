function mixin<T extends {}, R1>(
  target: T,
  mixer1: (target: T) => R1,
): T & R1;
function mixin<T extends {}, R1, R2>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
): T & R1 & R2;
function mixin<T extends {}, R1, R2, R3>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
): T & R1 & R2 & R3;
function mixin<T extends {}, R1, R2, R3, R4>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
  mixer4: (target: R2) => R4,
): T & R1 & R2 & R3 & R4;
function mixin<T extends {}, R1, R2, R3, R4, R5>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
  mixer4: (target: R2) => R4,
  mixer5: (target: R2) => R5,
): T & R1 & R2 & R3 & R4 & R5;
function mixin<T extends {}, R1, R2, R3, R4, R5, R6>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
  mixer4: (target: R2) => R4,
  mixer5: (target: R2) => R5,
  mixer6: (target: R2) => R6,
): T & R1 & R2 & R3 & R4 & R5 & R6;
function mixin<T extends {}, R1, R2, R3, R4, R5, R6, R7>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
  mixer4: (target: R2) => R4,
  mixer5: (target: R2) => R5,
  mixer6: (target: R2) => R6,
  mixer7: (target: R2) => R7,
): T & R1 & R2 & R3 & R4 & R5 & R6 & R7;
function mixin<T extends {}, R1, R2, R3, R4, R5, R6, R7, R8>(
  target: T,
  mixer1: (target: T) => R1,
  mixer2: (target: R1) => R2,
  mixer3: (target: R2) => R3,
  mixer4: (target: R2) => R4,
  mixer5: (target: R2) => R5,
  mixer6: (target: R2) => R6,
  mixer7: (target: R2) => R7,
  mixer8: (target: R2) => R8,
): T & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8;
function mixin(target: {}, ...mixers: Array<(target: {}) => {}>): {} {
  mixers.forEach((mixer) => mixer(target));
  return target;
}

export default mixin;
