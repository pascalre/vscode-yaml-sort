import { Settings } from "../settings";

export class SortUtil {
  settings: Settings
  custom = 0

  constructor(settings: Settings, custom = 0) {
    this.settings = settings
    this.custom = custom
  }

  localeSort(a: string, b: string): number {
    return a.localeCompare(b, this.settings.getLocale())
  }

  customSort(a: string, b: string): number {
    const sortOrder = this.settings.getCustomSortKeywords(this.custom)
    const indexA = sortOrder.indexOf(a)
    const indexB = sortOrder.indexOf(b)

    if (indexA > -1 && indexB > -1) {
      if (indexA > indexB) {
        return 1
      }
      if (indexA < indexB) {
        return -1
      }
      return 0
    }
    if (indexA !== -1 && indexB === -1) {
      return -1
    }
    if (indexA === -1 && indexB !== -1) {
      return 1
    }
    return this.localeSort(a, b)
  }

  getSortingAlgorithm() {
    if (this.custom > 0 && this.settings.getUseCustomSortRecursively()) {
      return this.customSort
    } else {
      return this.localeSort
    }
  }
}