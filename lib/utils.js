export function pxToRem(pxValue, baseFontSize) {
  return `${pxValue / baseFontSize}rem`;
}

export function pxToRemCurry(baseFontSize) {
  return (pxValue) => pxToRem(pxValue, baseFontSize);
}
