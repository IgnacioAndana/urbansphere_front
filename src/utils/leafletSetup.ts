import * as L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

let iconosConfigurados = false

/** Evita URLs externas (unpkg) y el warning de Tracking Prevention en Edge. */
export function configurarIconosLeaflet(): void {
  if (iconosConfigurados) return
  iconosConfigurados = true

  const iconDefault = L.Icon.Default.prototype as L.Icon.Default & {
    _getIconUrl?: unknown
  }
  delete iconDefault._getIconUrl

  L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
  })
}
