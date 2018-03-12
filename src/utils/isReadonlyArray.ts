function isReadonlyArray(value: any): value is ReadonlyArray<any> {
  return Array.isArray(value);
}

export default isReadonlyArray;
