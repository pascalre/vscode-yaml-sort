import { deepEqual, equal } from "assert"

import { Settings } from "../../../settings"
import { SortUtil, sortArraysRecursively } from "../../../util/sort-util"

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
suite("Test sortArraysRecursively()", () => {
  test("should sort numbers numerically, then booleans, then strings", () => {
    const value = ["c", 10, true, "b", 2, false]

    sortArraysRecursively(value)

    deepEqual(value, [2, 10, false, true, "b", "c"])
  })

  test("should keep mappings and nested lists after the scalars in their original order", () => {
    const value = [{ name: "b" }, "z", { name: "a" }, ["y", "x"]]

    sortArraysRecursively(value)

    deepEqual(value, ["z", { name: "b" }, { name: "a" }, ["x", "y"]])
  })

  test("should sort arrays nested in mappings", () => {
    const value = { a: { b: [3, 1, 2] }, c: null }

    sortArraysRecursively(value)

    deepEqual(value, { a: { b: [1, 2, 3] }, c: null })
  })
})
