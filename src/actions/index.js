
export const ADD_MARKER = 'ADD_MARKER'
export const INC_COUNTER = 'INC_COUNTER'

export function addMarker(coords) {
  return { type: ADD_MARKER, coords }
}

export function incCounter() {
  return { type: INC_COUNTER }
}
