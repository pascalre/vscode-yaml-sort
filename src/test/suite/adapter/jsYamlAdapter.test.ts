import * as assert from "assert"
import { sortYaml } from "../../../extension"
import { Settings } from "../../../settings"
import * as jsyaml from "js-yaml"

suite("Test dumpYaml", () => {

    test("when useCustomSortRecursively is set to `true` should recursively use customSort", async () => {
      const actual =
        'keyword1: value\n' +
        'keyword: value\n' +
        'keyword2: value\n' +
        'data:\n' +
        '  apiVersion: value\n' +
        '  keyword: value\n' +
        '  data: value\n' +
        '  kind: value\n' +
        'kind: value'
  
      const expected =
        'kind: value\n' +
        'data:\n' +
        '  apiVersion: value\n' +
        '  kind: value\n' +
        '  data: value\n' +
        '  keyword: value\n' +
        'keyword: value\n' +
        'keyword1: value\n' +
        'keyword2: value'
  
      const settings = new Settings()
      settings.getUseCustomSortRecursively = function () {
        return true
      }
      assert.strictEqual(sortYaml(actual, 1, settings), expected)
    })
  
    test("when locale is `en` should sort character `ä` over `z`", () => {
      const actual =
        'ä: value\n' +
        'z: value'
  
      const expected =
        'ä: value\n' +
        'z: value'
  
      const settings = new Settings()
      settings.getLocale = function () {
        return "en"
      }
      settings.getUseCustomSortRecursively = function () {
        return true
      }
      assert.strictEqual(sortYaml(actual, 1, settings), expected)
    })
  
    test("when locale is `sv` should sort character `z` over `ä`", () => {
      const actual =
        'ä: value\n' +
        'z: value'
  
      const expected =
        'z: value\n' +
        'ä: value'
  
      const settings = new Settings()
      settings.getLocale = function () {
        return "sv"
      }
      assert.strictEqual(sortYaml(actual, 1, settings), expected)
    })
    
    test("should ignore case when sorting", () => {
      const actual =
        'completedDate: value\n' +
        'completeTask: value'
  
      const expected =
        'completedDate: value\n' +
        'completeTask: value'

      const settings = new Settings()
      settings.getUseCustomSortRecursively = function () {
        return true
      }
      assert.strictEqual(sortYaml(actual, 1, settings), expected)
    })
    
  })