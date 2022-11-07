import * as assert from "assert"
import { Settings } from "../../../settings"
import { Sort } from "../../../util/sort"

suite("Test Sort - localeSort()", () => {
  test("when `locale` is `sv` and a is `ä` and b is `z` should return 1", () => {
    const settings = new Settings()
    settings.getLocale = function () {
      return "sv"
    }
    const sort = new Sort(settings)
    assert.strictEqual(sort.localeSort("ä", "z"), 1)
  })

  test("when `locale` is `en` and a is `ä` and b is `z` should return -1", () => {
    const settings = new Settings()
    settings.getLocale = function () {
      return "en"
    }
    const sort = new Sort(settings)
    assert.strictEqual(sort.localeSort("ä", "z"), -1)
  })
})

suite("Test Sort - customSort()", () => {
  const settings = new Settings()
  settings.getCustomSortKeywords = function () {
    return ['kind', 'data']
  }
  const sort = new Sort(settings)
  sort.custom = 1

  test("when `custom` is `1` and keywords are `['kind', 'data']` and a is `data` and b is `kind` should return 1", () => {
    assert.strictEqual(sort.customSort("data", "kind"), 1)
  })
  test("when `custom` is `1` and keywords are `['kind', 'data']` and a is `kind` and b is `data` should return -1", () => {
    assert.strictEqual(sort.customSort("kind", "data"), -1)
  })
  test("when `custom` is `1` and keywords are `['kind', 'data']` and a is `kind` and b is `kind` should return 0", () => {
    assert.strictEqual(sort.customSort("kind", "kind"), 0)
  })
})

suite("Test Sort - getSortingAlgorithm()", () => {
  test("when `custom` is bigger than `0` and useCustomSortRecursively is `true` return customSort", () => {
    const settings = new Settings()
    settings.getUseCustomSortRecursively = function () {
      return true
    }
    const sort = new Sort(settings)
    sort.custom = 1
    assert.strictEqual(sort.getSortingAlgorithm(), sort.customSort)
  })
  test("when `custom` is `0` return localeSort", () => {
    const settings = new Settings()
    const sort = new Sort(settings)
    assert.strictEqual(sort.getSortingAlgorithm(), sort.localeSort)
  })
})