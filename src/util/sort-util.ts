import { Settings } from "../settings"

export class SortUtil {
  settings: Settings
  custom = 0

  constructor(settings: Settings, custom = 0) {
    this.settings = settings
    this.custom = custom
  }

  customSort(a: string, b: string): number {
    const sortOrderReverse = this.settings.sortOrderReverse
    const sortOrder = this.settings.getCustomSortKeywords(this.custom)
    const indexA = sortOrder.indexOf(a)
    const indexB = sortOrder.indexOf(b)

    if (indexA > -1 && indexB > -1) {
      return SortUtil.compare(indexA, indexB)
    }
    if (indexA !== -1 && indexB === -1) {
      return -1
    }
    if (indexA === -1 && indexB !== -1) {
      return 1
    }
    if (sortOrderReverse) {
      return this.localeSort(b, a)
    }
    return this.localeSort(a, b)
  }

  static compare(a: number, b: number) {
    if (a > b) {
      return 1
    }

    if (a < b) {
      return -1
    }

    return 0
  }

  localeSort(a: string, b: string): number {
    return a.localeCompare(b, this.settings.locale)
  }
}
