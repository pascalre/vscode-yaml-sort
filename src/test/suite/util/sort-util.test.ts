import { equal } from "assert"

import { Settings } from "../../../settings"
import { SortUtil } from "../../../util/sort-util"

suite("Test Sort - localeSort()", () => {
  test("when `locale` is `sv` and a is `ä` and b is `z` should return 1", () => {
    const settings = new Settings()
    settings.locale = "sv"
    const sort = new SortUtil(settings)
    equal(sort.localeSort("ä", "z"), 1)
  })

  test("when `locale` is `en` and a is `ä` and b is `z` should return -1", () => {
    const settings = new Settings()
    settings.locale = "en"
    const sort = new SortUtil(settings)
    equal(sort.localeSort("ä", "z"), -1)
  })
})

suite("Test Sort - customSort()", () => {
  const settings = new Settings()
  settings.getCustomSortKeywords = function () {
    return ["kind", "data"]
  }
  const sort = new SortUtil(settings)
  sort.custom = 1

  test("when `custom` is `1` and keywords are `['kind', 'data']` and a is `data` and b is `kind` should return 1", () => {
    equal(sort.customSort("data", "kind"), 1)
  })
  test("when `custom` is `1` and keywords are `['kind', 'data']` and a is `kind` and b is `data` should return -1", () => {
    equal(sort.customSort("kind", "data"), -1)
  })
  test("when `custom` is `1` and keywords are `['kind', 'kind']` and a is `kind` and b is `kind` should return 0", () => {
    equal(sort.customSort("kind", "kind"), 0)
  })

  sort.custom = 0
  sort.settings.sortOrderReverse = false
  test("when `sortOrderReverse` is false and keywords are `['kind', 'data']` should return 1", () => {
    equal(sort.customSort("data", "kind"), 1)
    equal(sort.customSort("kind", "data"), -1)
    equal(sort.customSort("kind", "kind"), 0)
  })
  sort.settings.sortOrderReverse = true
  test("when `sortOrderReverse` is true and keywords are `['abc', 'bcd']` should return -1", () => {
    equal(sort.customSort("abc", "bcd"), -1)
    equal(sort.customSort("b", "a"), 1)
    equal(sort.customSort("a", "a"), 0)
  })
  sort.custom = 1
  sort.settings.sortOrderReverse = false

})

suite("Test Sort - sortKeys()", () => {

  test("when a is `template` and b is `parameters` should return -1 (see #205)", () => {
    equal(SortUtil.sortKeys("template", "parameters"), -1)
  })

  test("when a is `parameters` and b is `template` should return 1 (see #205)", () => {
    equal(SortUtil.sortKeys("parameters", "template"), 1)
  })

  test("when a is `parameters` and b is `stages` should return -1", () => {
    equal(SortUtil.sortKeys("parameters", "stages"), -1)
  })

  test("when a is `template` and b is `stages` should return 1", () => {
    equal(SortUtil.sortKeys("template", "stages"), 1)
  })

  test("when a is `b` and b is `a` should return 1", () => {
    equal(SortUtil.sortKeys("b", "a"), 1)
  })

  test("when a is `a` and b is `a` should return 0", () => {
    equal(SortUtil.sortKeys("a", "a"), 0)
  })
})

suite("Test Sort - customSort() with azure devops template references (see #205)", () => {
  const devOpsSettings = new Settings()
  devOpsSettings.getCustomSortKeywords = function () {
    return []
  }
  const devOpsSort = new SortUtil(devOpsSettings)
  devOpsSort.custom = 2

  test("when a is `template` and b is `parameters` should return -1", () => {
    equal(devOpsSort.customSort("template", "parameters"), -1)
  })

  test("when a is `parameters` and b is `template` should return 1", () => {
    equal(devOpsSort.customSort("parameters", "template"), 1)
  })
})
