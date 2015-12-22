
export const ADD_MARKER = 'ADD_MARKER'

export function addMarker(coords) {
  return {
    type: ADD_MARKER,
    coords: coords
  }
}
