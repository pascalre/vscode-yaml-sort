import { Settings } from "../settings"

// an azure devops template reference consists of the keys `template` and
// `parameters`. to keep such a reference readable, the template must always
// be sorted in front of its parameters (see #205)
const templateReference = ["template", "parameters"]

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
    // keep the keys of an azure devops template reference in a readable
    // order (see #205)
    const templateReferenceA = templateReference.indexOf(a)
    const templateReferenceB = templateReference.indexOf(b)
    if (templateReferenceA !== -1 && templateReferenceB !== -1) {
      return SortUtil.compare(templateReferenceA, templateReferenceB)
    }
    if (sortOrderReverse) {
      return this.localeSort(b, a)
    }
    return this.localeSort(a, b)
  }

  /**
   * Sorts keys like the default sort of an array of strings, but keeps the
   * keys of an azure devops template reference in a readable order (see #205)
   */
  sortKeys(a: string, b: string): number {
    const templateReferenceA = templateReference.indexOf(a)
    const templateReferenceB = templateReference.indexOf(b)
    if (templateReferenceA !== -1 && templateReferenceB !== -1) {
      return SortUtil.compare(templateReferenceA, templateReferenceB)
    }
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
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
