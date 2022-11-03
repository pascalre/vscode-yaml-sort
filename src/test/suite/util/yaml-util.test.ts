import * as assert from "assert"
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import jsyaml = require("js-yaml")
import { Settings } from "../../../settings"
import { formatYaml, sortYaml } from "../../../util/yaml-util"

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

suite("Test dumpYaml", () => {
  test("should recursively use customSort", () => {
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
  test("should sort with by locale behaviour", () => {
    const actual =
      'ä: value\n' +
      'z: value'
  
    let expected =
      'ä: value\n' +
      'z: value'
  
    const settings = new Settings()
    settings.getUseCustomSortRecursively = function () {
      return true
    }
    assert.strictEqual(sortYaml(actual, 1, settings), expected)
  
    expected =
      'z: value\n' +
      'ä: value'
  
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
  
  
  suite("Test sortYaml", () => {
  test("should sort a given yaml document", async () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      '  key: >\n' +
      '      This is a very long sentence\n' +
      '      that spans several lines in the YAML\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3\n'
  
    const expected =
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3\n' +
      'persons:\n' +
      '  bob:\n' +
      '    age: 23\n' +
      '    place: Germany\n' +
      '  key: |\n' +
      '    This is a very long sentence that spans several lines in the YAML'
  
    assert.strictEqual(sortYaml(actual, 0, new Settings()), expected)
  })
  
  test("should put top level keyword `spec` before `data` when passing customsort=1", async () => {
    let actual =
      'data: data\n' +
      'spec: spec'
  
    let expected =
      'spec: spec\n' +
      'data: data\n'
  
    assert.strictEqual(sortYaml(actual, 1, new Settings()), expected)
  
    actual =
      'data: data\n' +
      'spec:\n' +
      '  - aa: b'
  
    expected =
      'spec:\n' +
      '  - aa: b\n' +
      'data: data\n'
  
    assert.strictEqual(sortYaml(actual, 1, new Settings()), expected)
  
    actual =
      'data:\n' +
      '  job: Developer\n' +
      '  skills:\n' +
      '    - pascal\n' +
      'spec:\n' +
      '  job: Boss\n' +
      '  name: Stuart'
  
    expected =
      'spec:\n' +
      '  job: Boss\n' +
      '  name: Stuart\n' +
      'data:\n' +
      '  job: Developer\n' +
      '  skills:\n' +
      '    - pascal\n'
  
    assert.strictEqual(sortYaml(actual, 1, new Settings()), expected)
  
    actual =
      'data: data\n' +
      'spec:\n' +
      '  - a\n' +
      '  - b'
  
    expected =
      'spec:\n' +
      '  - a\n' +
      '  - b\n' +
      'data: data\n'
  
    assert.strictEqual(sortYaml(actual, 1, new Settings()), expected)
  })
  
  test("should wrap words after 500 characters (`vscode-yaml-sort.lineWidth`)", () => {
    const actual =
      '- lorem ipsum:\n' +
      '    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut ' +
      'labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea ' +
      'rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor ' +
      'sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
      'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e"'
  
    const expected =
      '- lorem ipsum:\n' +
      '    text: >-\n' +
      '      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut ' +
      'labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ' +
      'ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor ' +
      'sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna ' +
      'aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo\n' +
      '      dolores et e'
  
    assert.strictEqual(sortYaml(actual, 0, new Settings()), expected)
  })
  
  test("should add an empty line before `spec`", () => {
    const actual =
      'spec: value\n' +
      'data:\n' +
      '  - a\n' +
      '  - b'
  
    const expected =
      'data:\n' +
      '  - a\n' +
      '  - b\n' +
      '\n' +
      'spec: value'
  
    const settings = new Settings()
    settings.getEmptyLinesUntilLevel = function () {
      return 2
    }
    assert.strictEqual(sortYaml(actual, 0, settings), expected)
  })
  test("should not format a date in CORE_SCHEMA", () => {
    const actual = 'AWSTemplateFormatVersion: 2010-09-09'
    let expected = 'AWSTemplateFormatVersion: 2010-09-09T00:00:00.000Z'
    assert.strictEqual(sortYaml(actual, 0, new Settings()), expected)
  
    expected = actual
  
    const settings = new Settings()
    settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }
    assert.strictEqual(sortYaml(actual, 0, settings), expected)
  })
  test("should sort a yaml with CLOUDFORMATION_SCHEMA", () => {
    const actual =
      'LoggingBucketKMSKeyAlias:\n' +
      '  Properties:\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"'
  
    const expected =
      'LoggingBucketKMSKeyAlias:\n' +
      '\n' +
      '  Properties:\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"'
  
    const settings = new Settings()
    settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    settings.getForceQuotes = function () {
      return true
    }
    settings.getQuotingType = function () {
      return "\""
    }
    settings.getEmptyLinesUntilLevel = function () {
      return 2
    }
    assert.strictEqual(sortYaml(actual, 0, settings), expected)
  })
  test("compatibility with older yaml versions should be configurable", () => {
    const actual =
      'key:\n' +
      '  on: foo\n' +
      '  off: egg'
  
    let expected =
      'key:\n' +
      '  "off": egg\n' +
      '  "on": foo'
  
    const settings = new Settings()
    settings.getNoCompatMode = function () {
      return false
    }
    settings.getQuotingType = function () {
      return "\""
    }
    assert.strictEqual(sortYaml(actual, 0, settings), expected)
  
    expected =
      'key:\n' +
      '  off: egg\n' +
      '  on: foo'
    settings.getNoCompatMode = function () {
      return true
    }
    assert.strictEqual(sortYaml(actual, 0, settings), expected)
  })
  })
  

suite("Test formatYaml", () => {
  test("should sort all yaml files in directory", () => {
    const actual =
      'persons:\n' +
      '  bob:\n' +
      '    place: "Germany"\n' +
      '    age: 23\n' +
      '"animals":\n' +
      '  kitty:\n' +
      '    age: 3'

    let expected =
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    const settings = new Settings()
    settings.getUseLeadingDashes = function () {
      return false
    }
    assert.strictEqual(formatYaml(actual, false, settings), expected)

    expected =
      '---\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    assert.strictEqual(formatYaml(actual, true, new Settings()), expected)
  })

  test("should return `null` on invalid yaml", () => {
    assert.strictEqual(formatYaml('key: 1\nkey: 1', true, new Settings()), null)
  })
})