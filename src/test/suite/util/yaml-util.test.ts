import { equal } from "assert"

import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import jsyaml = require("js-yaml")

import { Settings } from "../../../settings"
import { YamlUtil } from "../../../util/yaml-util"

suite("Test sortArrays", () => {
  const yamlutil = new YamlUtil()
  const text = 
    'array:\n' +
    '  - python\n' +
    '  - perl'

  test("when sortArrays is set to false, should not sort arrays", () => {
    const actual = yamlutil.sortYaml(text)
    equal(actual, text)
  })

  test("when sortArrays is set to true, should sort arrays", () => {
    yamlutil.settings.sortArrays = true
    const actual = yamlutil.sortYaml('foo')
    const expected = 'foo'
    equal(actual, expected)
  })

  test("when sortArrays is set to true, should sort arrays", () => {
    yamlutil.settings.sortArrays = true
    const actual = yamlutil.sortYaml(text)
    const expected = 
      'array:\n' +
      '  - perl\n' +
      '  - python'
    equal(actual, expected)
  })

  test("when sortArrays is set to true, should sort nested arrays", () => {
    yamlutil.settings.sortArrays = true
    const text = 
      'foo:\n' +
      '  array:\n' +
      '    - python\n' +
      '    - perl'
    const actual = yamlutil.sortYaml(text)
    const expected = 
      'foo:\n' +
      '  array:\n' +
      '    - perl\n' +
      '    - python'
    equal(actual, expected)
  })
})

suite("Test dumpYaml", () => {

  test("when useCustomSortRecursively is set to `true` should recursively use customSort", () => {
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
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  })

  test("when locale is `en` should sort character `ä` over `z`", () => {
    const actual =
      'ä: value\n' +
      'z: value'

    const expected =
      'ä: value\n' +
      'z: value'

    const settings = new Settings()
    settings.locale = "en"
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  })

  test("when locale is `sv` should sort character `z` over `ä`", () => {
    const actual =
      'ä: value\n' +
      'z: value'

    const expected =
      'z: value\n' +
      'ä: value'

    const settings = new Settings()
    settings.locale = "sv"
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  })

  test("should ignore case when sorting", () => {
    const actual =
      'completedDate: value\n' +
      'completeTask: value'

    const expected =
      'completedDate: value\n' +
      'completeTask: value'

    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
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
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  })
  test("should sort with by locale behaviour", () => {
    const actual =
      'ä: value\n' +
      'z: value'
  
    let expected =
      'ä: value\n' +
      'z: value'
  
    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  
    expected =
      'z: value\n' +
      'ä: value'
  
    yamlutil.settings.locale = "sv"
    equal(yamlutil.sortYaml(actual, 1), expected)
  })
  test("should ignore case when sorting", () => {
    const actual =
      'completedDate: value\n' +
      'completeTask: value'
  
    const expected =
      'completedDate: value\n' +
      'completeTask: value'
  
    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 1), expected)
  })
})


suite("Test sortYaml", () => {
  test("should sort a given yaml document", () => {
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
  
    const yamlutil = new YamlUtil()
    equal(yamlutil.sortYaml(actual, 1), expected)
  })
  
  test("should put top level keyword `spec` before `data` when passing customsort=1", () => {
    let actual =
      'data: data\n' +
      'spec: spec'
  
    let expected =
      'spec: spec\n' +
      'data: data\n'
  
    const yamlutil = new YamlUtil()
    equal(yamlutil.sortYaml(actual, 1), expected)
  
    actual =
      'data: data\n' +
      'spec:\n' +
      '  - aa: b'
  
    expected =
      'spec:\n' +
      '  - aa: b\n' +
      'data: data\n'
  
    equal(yamlutil.sortYaml(actual, 1), expected)
  
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
  
    equal(yamlutil.sortYaml(actual, 1), expected)
  
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
  
    equal(yamlutil.sortYaml(actual, 1), expected)
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
  
    const yamlutil = new YamlUtil()
    equal(yamlutil.sortYaml(actual, 1), expected)
  })
  test("should not format a date in CORE_SCHEMA", () => {
    const actual = 'AWSTemplateFormatVersion: 2010-09-09'
    let expected = 'AWSTemplateFormatVersion: 2010-09-09T00:00:00.000Z'
    let yamlutil = new YamlUtil()
    equal(yamlutil.sortYaml(actual, 0), expected)
  
    expected = actual
  
    const settings = new Settings()
    settings.getSchema = function () {
      return jsyaml.CORE_SCHEMA
    }
    yamlutil = new YamlUtil(settings)

    equal(yamlutil.sortYaml(actual, 0), expected)
  })
  test("should sort a yaml with CLOUDFORMATION_SCHEMA", () => {
    const actual =
      'LoggingBucketKMSKeyAlias:\n' +
      '  Properties:\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"'
  
    const expected =
      'LoggingBucketKMSKeyAlias:\n' +
      '  Properties:\n' +
      '    AliasName: !Sub "alias/AppName/Environment/s3-logging-kms"\n' +
      '    TargetKeyId: !Sub "LoggingBucketKMSKey"'
  
    const settings = new Settings()
    settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    settings.forceQuotes = true
    settings.getQuotingType = function () {
      return "\""
    }
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 0), expected)
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
    settings.noCompatMode = false
    settings.getQuotingType = function () {
      return "\""
    }
    const yamlutil = new YamlUtil(settings)
    equal(yamlutil.sortYaml(actual, 0), expected)
  
    expected =
      'key:\n' +
      '  off: egg\n' +
      '  on: foo'
    yamlutil.settings.noCompatMode = true
    equal(yamlutil.sortYaml(actual, 0), expected)
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
    settings.useLeadingDashes = false
    let yamlutil = new YamlUtil(settings)
    equal(yamlutil.formatYaml(actual, false), expected)

    expected =
      '---\n' +
      'persons:\n' +
      '  bob:\n' +
      '    place: Germany\n' +
      '    age: 23\n' +
      'animals:\n' +
      '  kitty:\n' +
      '    age: 3'

    yamlutil = new YamlUtil()
    equal(yamlutil.formatYaml(actual, true), expected)
  })

  test("should return `null` on invalid yaml", () => {
    const yamlutil = new YamlUtil()
    equal(yamlutil.formatYaml('key: 1\nkey: 1', true), null)
  })
})

suite("Test YamlUtil - getNumberOfLeadingSpaces()", () => {
  test("should return the number of leading spaces of 'text'", () => {
    equal(YamlUtil.getNumberOfLeadingSpaces("  foo"), 2)
    equal(YamlUtil.getNumberOfLeadingSpaces("foo"), 0)
    equal(YamlUtil.getNumberOfLeadingSpaces("foo  "), 0)
  })
})

suite("Test YamlUtil - isValueMultiline", () => {
  test("when text starts with '-' should return true", () => {
    const text =
      '- foo: bar\n' +
      '  bar: baz'
    equal(YamlUtil.isValueMultiline(text), true)
  })
})

suite("Test YamlUtil - transformMultilineValue()", () => {
  const yamlutil = new YamlUtil()
  yamlutil.settings.indent = 2
  test("Should prepend spaces on each line", () => {
    const text =
      '- foo: bar\n' +
      '  bar: baz'
    const expected =
      '  - foo: bar\n' +
      '    bar: baz'
    equal(yamlutil.transformMultilineValue(text), expected)
  })
  test("When text ends with newline should remove trailing indent", () => {
    const text =
      '- foo: bar\n' +
      '  bar: baz\n'
    const expected =
      '  - foo: bar\n' +
      '    bar: baz\n'
    equal(yamlutil.transformMultilineValue(text), expected)
  })
})
/*
suite("Test YamlUtil - getDelimiters()", () => {
  test("should return `` when the input string does not contain a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    const doc =
      'yaml: data\n' +
      'spec: spec'

    equal(new YamlUtil().getDelimiters(doc, true), "")
  })
  test("should return all delimiters except the first (return an empty string instead) when the input document starts with a delimiter and isSelectionEmpty=true and useLeadingDashes=false", () => {
    const doc =
      '--- text\n' +
      'yaml: data\n' +
      '---  #comment\n' +
      'spec: spec'
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false
    const actual = yamlutil.getDelimiters(doc, true)

    deepequal(actual, ["", "\n---  #comment\n"])
  })
  test("should add leading dashes when useLeadingDashes=true and given document does not have leading dashes", () => {
    const doc =
      'foo: bar\n' +
      '---\n' +
      'foo2: baz'
    const actual = new YamlUtil().getDelimiters(doc, true)

    deepequal(actual, ["---\n", "\n---\n"])
  })
  test("Get each delimiter (empty selection, leading linebreak)", () => {
    const doc = 
      '\n' +
      '--- text\n' +
      'yaml: data\n' +
      '---  #comment\n' +
      'spec: spec---\n' +
      '\n'

    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false
    const actual = yamlutil.getDelimiters(doc, true)
    deepequal(actual, ["", "\n---  #comment\n"])
  })
  test("Get each delimiter (empty selection, leading text)", () => {
    const doc = 
      'bla\n' +
      '--- text\n' +
      'test: bla'
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false
    const actual = yamlutil.getDelimiters(doc, true)
    deepequal(actual, ["", "\n--- text\n"])
  })
  test("Get each delimiter (with selection, leading delimiter)", () => {
    const doc = 
      '--- text\n' +
      'test: bla'
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false
    const actual = yamlutil.getDelimiters(doc, false)
    deepEqual(actual, ["--- text\n"])
  })
  test("Get each delimiter (with selection, leading text)", () => {
    const doc = 
      'bla\n' +
      '--- text\n' +
      'test: bla'
    const yamlutil = new YamlUtil()
    yamlutil.settings.useLeadingDashes = false
    const actual = yamlutil.getDelimiters(doc, false)
    deepEqual(actual, ["", "\n--- text\n"])
  })
})
*/