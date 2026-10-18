export const DOMICILE_A_GAUCHE = true

export function orienter<T>(a: T, b: T): [T, T] {
  return DOMICILE_A_GAUCHE ? [b, a] : [a, b]
}