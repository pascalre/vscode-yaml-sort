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

  static compare<T extends number | string>(a: T, b: T): number {
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

/**
 * Rank of a yaml value inside a sorted array: numbers, booleans and strings are sorted,
 * everything else (mappings, nested lists, null) keeps its relative order at the end.
 */
const rankOf = (value: unknown): number => {
  switch (typeof value) {
    case "number":
      return 0
    case "boolean":
      return 1
    case "string":
      return 2
    default:
      return 3
  }
}

/**
 * Consistent comparison for array items of mixed types, see rankOf().
 */
const compareArrayItems = (a: unknown, b: unknown): number => {
  const rankDifference = rankOf(a) - rankOf(b)
  if (rankDifference !== 0) {
    return rankDifference
  }
  if (rankOf(a) === 3) {
    // Array.prototype.sort is stable, so these items keep their order
    return 0
  }
  return SortUtil.compare(a as number | string, b as number | string)
}

/**
 * Sorts every array inside a loaded yaml value in place, including nested ones.
 * @param value Loaded yaml value.
 */
export const sortArraysRecursively = (value: unknown): void => {
  if (value === null || typeof value !== "object") {
    return
  }
  if (Array.isArray(value)) {
    value.sort(compareArrayItems)
  }
  Object.values(value).forEach(sortArraysRecursively)
}
