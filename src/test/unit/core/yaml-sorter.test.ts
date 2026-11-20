import { equal, throws } from "assert"

import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema"
import { CORE_SCHEMA } from "js-yaml"

import { Settings } from "../../../core/settings"
import { YamlSorter } from "../../../core/yaml-sorter"

suite("Test sortArrays", () => {
  const yamlSorter = new YamlSorter()
  const text = 
    "array:\n" +
    "  - python\n" +
    "  - perl"

  test("when sortArrays is set to false, should not sort arrays", () => {
    const actual = yamlSorter.sortYaml(text)
    equal(actual, text)
  })

  test("when sortArrays is set to true, should sort arrays", () => {
    yamlSorter.settings.sortArrays = true
    const actual = yamlSorter.sortYaml("foo")
    const expected = "foo"
    equal(actual, expected)
  })

  test("when sortArrays is set to true, should sort arrays", () => {
    yamlSorter.settings.sortArrays = true
    const actual = yamlSorter.sortYaml(text)
    const expected = 
      "array:\n" +
      "  - perl\n" +
      "  - python"
    equal(actual, expected)
  })

  test("when sortArrays is set to true, should sort nested arrays", () => {
    yamlSorter.settings.sortArrays = true
    const text = 
      "foo:\n" +
      "  array:\n" +
      "    - python\n" +
      "    - perl"
    const actual = yamlSorter.sortYaml(text)
    const expected = 
      "foo:\n" +
      "  array:\n" +
      "    - perl\n" +
      "    - python"
    equal(actual, expected)
  })
})

suite("Test dumpYaml", () => {
  test("when useCustomSortRecursively is set to`true` should recursively use customSort", () => {
    const actual =
      "keyword1: value\n" +
      "keyword: value\n" +
      "keyword2: value\n" +
      "data:\n" +
      "  apiVersion: value\n" +
      "  keyword: value\n" +
      "  data: value\n" +
      "  kind: value\n" +
      "kind: value"

    const expected =
      "kind: value\n" +
      "data:\n" +
      "  apiVersion: value\n" +
      "  kind: value\n" +
      "  data: value\n" +
      "  keyword: value\n" +
      "keyword: value\n" +
      "keyword1: value\n" +
      "keyword2: value"

    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })

  test("when locale is `en` should sort character `ä` over `z`", () => {
    const actual =
      "ä: value\n" +
      "z: value"

    const expected =
      "ä: value\n" +
      "z: value"

    const settings = new Settings()
    settings.locale = "en"
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })

  test("when locale is `sv` should sort character `z` over `ä`", () => {
    const actual =
      "ä: value\n" +
      "z: value"

    const expected =
      "z: value\n" +
      "ä: value"

    const settings = new Settings()
    settings.locale = "sv"
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })

  test("should ignore case when sorting", () => {
    const actual =
      "completedDate: value\n" +
      "completeTask: value"

    const expected =
      "completedDate: value\n" +
      "completeTask: value"

    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })

})

suite("Test dumpYaml", () => {
  test("should recursively use customSort", () => {
    const actual =
      "keyword1: value\n" +
      "keyword: value\n" +
      "keyword2: value\n" +
      "data:\n" +
      "  apiVersion: value\n" +
      "  keyword: value\n" +
      "  data: value\n" +
      "  kind: value\n" +
      "kind: value"
  
    const expected =
      "kind: value\n" +
      "data:\n" +
      "  apiVersion: value\n" +
      "  kind: value\n" +
      "  data: value\n" +
      "  keyword: value\n" +
      "keyword: value\n" +
      "keyword1: value\n" +
      "keyword2: value"
  
    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })
  test("should sort with by locale behaviour", () => {
    const actual =
      "ä: value\n" +
      "z: value"
  
    let expected =
      "ä: value\n" +
      "z: value"
  
    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  
    expected =
      "z: value\n" +
      "ä: value"
  
    yamlSorter.settings.locale = "sv"
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })
  test("should ignore case when sorting", () => {
    const actual =
      "completedDate: value\n" +
      "completeTask: value"
  
    const expected =
      "completedDate: value\n" +
      "completeTask: value"
  
    const settings = new Settings()
    settings.useCustomSortRecursively = true
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })
})


suite("Test sortYaml", () => {
  test("should put top level keyword `spec` before `data` when passing customsort=1", () => {
    let actual =
      "data: data\n" +
      "spec: spec"
  
    let expected =
      "spec: spec\n" +
      "data: data"
  
    const yamlSorter = new YamlSorter()
    equal(yamlSorter.sortYaml(actual, 1), expected)
  
    actual =
      "data: data\n" +
      "spec:\n" +
      "  - aa: b"
  
    expected =
      "spec:\n" +
      "  - aa: b\n" +
      "data: data"
  
    equal(yamlSorter.sortYaml(actual, 1), expected)
  
    actual =
      "data:\n" +
      "  job: Developer\n" +
      "  skills:\n" +
      "    - pascal\n" +
      "spec:\n" +
      "  job: Boss\n" +
      "  name: Stuart"
  
    expected =
      "spec:\n" +
      "  job: Boss\n" +
      "  name: Stuart\n" +
      "data:\n" +
      "  job: Developer\n" +
      "  skills:\n" +
      "    - pascal"
  
    equal(yamlSorter.sortYaml(actual, 1), expected)
  
    actual =
      "data: data\n" +
      "spec:\n" +
      "  - a\n" +
      "  - b"
  
    expected =
      "spec:\n" +
      "  - a\n" +
      "  - b\n" +
      "data: data"
  
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })
  
  test("should wrap words after 500 characters (`vscode-yaml-sort.lineWidth`)", () => {
    const actual =
      "- lorem ipsum:\n" +
      "    text: \"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut " +
      "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea " +
      "rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor " +
      "sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna " +
      "aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et e\""
  
    const expected =
      "- lorem ipsum:\n" +
      "    text: >-\n" +
      "      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut " +
      "labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et " +
      "ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor " +
      "sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna " +
      "aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo\n" +
      "      dolores et e"
  
    const yamlSorter = new YamlSorter()
    equal(yamlSorter.sortYaml(actual, 1), expected)
  })
  test("should not format a date in CORE_SCHEMA", () => {
    const actual = "AWSTemplateFormatVersion: 2010-09-09"
    let expected = "AWSTemplateFormatVersion: 2010-09-09T00:00:00.000Z"
    let yamlSorter = new YamlSorter()
    equal(yamlSorter.sortYaml(actual, 0), expected)
  
    expected = actual
  
    const settings = new Settings()
    settings.getSchema = function () {
      return CORE_SCHEMA
    }
    yamlSorter = new YamlSorter(settings)

    equal(yamlSorter.sortYaml(actual, 0), expected)
  })
  test("should sort a yaml with CLOUDFORMATION_SCHEMA", () => {
    const actual =
      "LoggingBucketKMSKeyAlias:\n" +
      "  Properties:\n" +
      "    TargetKeyId: !Sub \"LoggingBucketKMSKey\"\n" +
      "    AliasName: !Sub \"alias/AppName/Environment/s3-logging-kms\""
  
    const expected =
      "LoggingBucketKMSKeyAlias:\n" +
      "  Properties:\n" +
      "    AliasName: !Sub \"alias/AppName/Environment/s3-logging-kms\"\n" +
      "    TargetKeyId: !Sub \"LoggingBucketKMSKey\""
  
    const settings = new Settings()
    settings.getSchema = function () {
      return CLOUDFORMATION_SCHEMA
    }
    settings.forceQuotes = true
    settings.getQuotingType = function () {
      return "\""
    }
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 0), expected)
  })
  test("compatibility with older yaml versions should be configurable", () => {
    const actual =
      "key:\n" +
      "  on: foo\n" +
      "  off: egg"
  
    let expected =
      "key:\n" +
      "  \"off\": egg\n" +
      "  \"on\": foo"
  
    const settings = new Settings()
    settings.noCompatMode = false
    settings.getQuotingType = function () {
      return "\""
    }
    const yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.sortYaml(actual, 0), expected)
  
    expected =
      "key:\n" +
      "  off: egg\n" +
      "  on: foo"
    yamlSorter.settings.noCompatMode = true
    equal(yamlSorter.sortYaml(actual, 0), expected)
  })
})

suite("Test formatYaml", () => {
  test("should sort all yaml files in directory", () => {
    const actual =
      "persons:\n" +
      "  bob:\n" +
      "    place: \"Germany\"\n" +
      "    age: 23\n" +
      "\"animals\":\n" +
      "  kitty:\n" +
      "    age: 3"

    let expected =
      "persons:\n" +
      "  bob:\n" +
      "    place: Germany\n" +
      "    age: 23\n" +
      "animals:\n" +
      "  kitty:\n" +
      "    age: 3"

    const settings = new Settings()
    settings.useLeadingDashes = false
    let yamlSorter = new YamlSorter(settings)
    equal(yamlSorter.formatYaml(actual, false), expected)

    expected =
      "---\n" +
      "persons:\n" +
      "  bob:\n" +
      "    place: Germany\n" +
      "    age: 23\n" +
      "animals:\n" +
      "  kitty:\n" +
      "    age: 3"

    yamlSorter = new YamlSorter()
    equal(yamlSorter.formatYaml(actual, true), expected)
  })

  test("should throw on invalid yaml", () => {
    const yamlSorter = new YamlSorter()
    throws(() => yamlSorter.formatYaml("key: 1\nkey: 1", true), /duplicated mapping key/)
  })
})

suite("Test YamlSorter - getNumberOfLeadingSpaces()", () => {
  test("should return the number of leading spaces of 'text'", () => {
    equal(YamlSorter.getNumberOfLeadingSpaces("  foo"), 2)
    equal(YamlSorter.getNumberOfLeadingSpaces("foo"), 0)
    equal(YamlSorter.getNumberOfLeadingSpaces("foo  "), 0)
  })
})

suite("Test YamlSorter - sortYaml() with quoted helm values", () => {
  test("GitHub issue #130: should not mangle a quoted helm value containing a dollar sign", () => {
    const yamlSorter = new YamlSorter()
    const text = "section:\n  label: '{{''$''}}'"

    equal(yamlSorter.sortYaml(text), text)
  })
})
suite("Test YamlSorter - sortYaml() with double-quoted helm values", () => {
  test("GitHub issue #283: should keep double quotes around a helm value", () => {
    const yamlSorter = new YamlSorter()
    const text = "foo: \"{{ .Fighters}}\""

    equal(yamlSorter.sortYaml(text), text)
  })
})

suite("Test YamlSorter - sortYaml() with kustomize patches", () => {
  test("GitHub issue #188: should keep a block scalar containing colons intact while sorting", () => {
    const util = new YamlSorter()
    const kustomize = "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nnamespace: monitor\nresources:\n  - bundle.yaml\n\npatches:\n  - target:\n      kind: ClusterRoleBinding\n      name: prometheus-operator\n    patch: |-\n      - op: replace\n        path: /subjects/0/namespace\n        value: monitor"

    const sorted = util.sortYaml(kustomize)

    equal(sorted.includes("patch: |-\n      - op: replace\n        path: /subjects/0/namespace\n        value: monitor"), true)
  })
})

suite("Test YamlSorter - sortYaml() with inline comments", () => {
  test("GitHub issue #222: should keep an inline comment while sorting", () => {
    const instance = new YamlSorter()
    const game = "game:\n  core:\n    serviceRpcTimeoutMillis: 6900000 # Extra-long for debugging locally"

    equal(instance.sortYaml(game), game)
  })
})

suite("Test YamlSorter - sortYaml() with docker-compose files", () => {
  test("GitHub issue #221: should keep a comment above a service while sorting with forceQuotes", () => {
    const composeSettings = new Settings()
    composeSettings.forceQuotes = true
    composeSettings.getQuotingType = function () {
      return "\""
    }
    const composeUtil = new YamlSorter(composeSettings)
    const composeYaml =
      "services:\n" +
      "  # https://hub.docker.com/_/mysql\n" +
      "  mysql5:\n" +
      "    depends_on:\n" +
      "      mysql5:\n" +
      "        condition: \"service_healthy\"\n" +
      "    image: \"mysql:5.7\""

    equal(composeUtil.sortYaml(composeYaml), composeYaml)
  })
})

suite("Test YamlSorter - sortYaml() keeps substituted values intact", () => {
  const yamlSorter = new YamlSorter()

  test("should keep more than ten helm values at their keys", () => {
    const lines = Array.from({ length: 12 }, (_, i) => `key${String(i).padStart(2, "0")}: "{{ .Values.value${i} }}"`)

    equal(yamlSorter.sortYaml([...lines].reverse().join("\n")), lines.join("\n"))
  })

  test("should keep an octal value when the same digits appear quoted earlier", () => {
    const text = "a: '0755'\nz: 0755"

    equal(yamlSorter.sortYaml(text), text)
  })
})

suite("Test YamlSorter - sortYaml() with custom sort and scalar values", () => {
  const yamlSorter = new YamlSorter()

  test("should keep number and boolean values of custom sort keywords", () => {
    equal(yamlSorter.sortYaml("spec: x\nkind: true\napiVersion: 3", 1), "apiVersion: 3\nkind: true\nspec: x")
  })

  test("should keep an empty mapping as value of a custom sort keyword", () => {
    equal(yamlSorter.sortYaml("spec: x\nmetadata: {}", 1), "metadata: {}\nspec: x")
  })

  test("should order custom sort keywords even if their values are falsy", () => {
    const text = "spec: x\nmetadata: null\nkind: false\napiVersion: 0"

    equal(yamlSorter.sortYaml(text, 1), "apiVersion: 0\nkind: false\nmetadata: null\nspec: x")
  })

  test("should not add a value to a document containing only a comment", () => {
    equal(yamlSorter.sortYaml("# only a comment"), "\n# only a comment")
  })

  test("should keep a document containing only a scalar", () => {
    equal(yamlSorter.sortYaml("42"), "42")
  })

  test("should keep a scalar value containing a colon on the line of its keyword", () => {
    equal(yamlSorter.sortYaml("spec: x\nkind: http://example.com", 1), "kind: http://example.com\nspec: x")
  })

  test("should keep a block scalar value of a keyword", () => {
    equal(yamlSorter.sortYaml("b: 1\nkind: |\n  line1\n  line2", 1), "kind: |\n  line1\n  line2\nb: 1")
  })

  test("should quote a keyword that needs quotes", () => {
    const settings = new Settings()
    settings.customSortKeywords1 = ["a: b"]

    equal(new YamlSorter(settings).sortYaml("c: 2\n'a: b': 1", 1), "'a: b': 1\nc: 2")
  })

  test("should end without a line break when every key is a keyword, like the default sort", () => {
    equal(yamlSorter.sortYaml("kind: x\napiVersion: v1", 1), "apiVersion: v1\nkind: x")
  })
})

suite("Test YamlSorter - sortYaml() with an empty mapping", () => {
  test("should keep a document containing only an empty mapping", () => {
    equal(new YamlSorter().sortYaml("{}"), "{}")
  })

  test("should keep a document containing only an empty mapping when formatting", () => {
    equal(new YamlSorter().formatYaml("{}", false), "{}")
  })
})

suite("Test YamlSorter - sortYaml() with sortOrderReverse", () => {
  const settings = new Settings()
  settings.sortOrderReverse = true
  const yamlSorter = new YamlSorter(settings)

  test("should sort keys in reverse order on every level", () => {
    equal(yamlSorter.sortYaml("a: 1\nc:\n  x: 1\n  z: 2\nb: 2"), "c:\n  z: 2\n  x: 1\nb: 2\na: 1")
  })

  test("should sort the remaining keys of a custom sort in reverse order", () => {
    equal(yamlSorter.sortYaml("a: 1\nkind: x\nb: 2", 1), "kind: x\nb: 2\na: 1")
  })
})

suite("Test YamlSorter - injected settings reach every processing step", () => {
  test("should use emptyLinesUntilLevel of the injected settings", () => {
    const settings = new Settings()
    settings.emptyLinesUntilLevel = 1

    equal(new YamlSorter(settings).sortYaml("b: 1\na: 2"), "a: 2\n\nb: 1")
  })

  test("should use the processor switches of the injected settings", () => {
    const settings = new Settings()
    settings.useCommentProcessor = false

    // without the comment processor js-yaml drops the comment
    equal(new YamlSorter(settings).sortYaml("b: 1\n# comment\na: 2"), "a: 2\nb: 1")
  })

  test("should format with the indentation of the injected settings", () => {
    const settings = new Settings()
    settings.indent = 4

    equal(new YamlSorter(settings).formatYaml("a:\n  b: 1", false), "a:\n    b: 1")
  })
})

suite("Test YamlSorter - sortYaml() with custom sort keeps the document intact", () => {
  const yamlSorter = new YamlSorter()

  test("should put the keywords in their order before the remaining keys", () => {
    equal(yamlSorter.sortYaml("data: 1\nkind: x\nb:\n  c: 1", 1), "kind: x\ndata: 1\nb:\n  c: 1")
  })

  test("should keep a document that only contains keywords", () => {
    equal(yamlSorter.sortYaml("kind: x", 1), "kind: x")
  })

  test("should leave a list document unchanged", () => {
    equal(yamlSorter.sortYaml("- kind: x\n- a: 1", 1), "- kind: x\n- a: 1")
  })

  test("should leave a scalar document unchanged", () => {
    equal(yamlSorter.sortYaml("42", 1), "42")
  })
})

suite("Test YamlSorter - sortYaml() with emptyLinesUntilLevel", () => {
  const settings = new Settings()
  settings.emptyLinesUntilLevel = 2
  const yamlSorter = new YamlSorter(settings)

  test("should not add empty lines inside a block scalar, which would change its value", () => {
    equal(yamlSorter.sortYaml("b: 1\na: |\n  foo: bar\n  baz: 1"), "a: |\n  foo: bar\n  baz: 1\n\nb: 1")
  })

  test("should add the empty line above the comment of a key, not between them", () => {
    equal(yamlSorter.sortYaml("b: 1\n# note\na: 1"), "# note\na: 1\n\nb: 1")
  })
})

