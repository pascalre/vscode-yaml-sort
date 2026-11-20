import { equal, notEqual, ok } from "assert"

import { ProcessorPipeline } from "../../../../core/processor/processor-pipeline"
import { Settings } from "../../../../core/settings"

/**
 * @returns Settings with all processors enabled, except the given one.
 */
const settingsWithout = (setting: "useArrayProcessor" | "useCommentProcessor" | "useHelmProcessor" | "useOctalProcessor" | "useBlockProcessor"): Settings => {
  const settings = new Settings()
  settings[setting] = false
  return settings
}

suite("Test ProcessorPipeline - preprocess() & postprocess()", () => {
  test("text should be the same after pre- and postprocessing", () => {
    const text =
      "foo: {{ .Value }}\n" +
      "# comment\n" +
      "bar: baz"
    const processor = new ProcessorPipeline(text)

    processor.preprocess()

    notEqual(processor.text, text)

    const text2 =
      "foo: {{ .Value }}\n" +
      "bar: baz"
    processor.text = text2
    processor.postprocess()

    equal(processor.text, text)
  })

  test("should replace tabs with spaces", () => {
    const processor = new ProcessorPipeline("a:\n\tb: 1")

    processor.preprocess()

    equal(processor.text, "a:\n  b: 1")
  })

  test("should hide and restore arrays when useArrayProcessor = true", () => {
    const text = "test: [ \"CMD\", \"pg_isready\" ]"
    const processor = new ProcessorPipeline(text)

    processor.preprocess()

    equal(processor.text, "test: vscode-yaml-sort.array.0")
    processor.postprocess()
    equal(processor.text, text)
  })

  test("should leave arrays alone when useArrayProcessor = false", () => {
    const text = "test: [ \"CMD\", \"pg_isready\" ]"
    const processor = new ProcessorPipeline(text, settingsWithout("useArrayProcessor"))

    processor.preprocess()

    equal(processor.text, text)
  })

  test("should restore comments when useCommentProcessor = true", () => {
    const processor = new ProcessorPipeline("# comment\nbar: baz")

    processor.preprocess()
    processor.text = "bar: baz"
    processor.postprocess()

    equal(processor.text, "# comment\nbar: baz")
  })

  test("should drop comments when useCommentProcessor = false", () => {
    const processor = new ProcessorPipeline("# comment\nbar: baz", settingsWithout("useCommentProcessor"))

    processor.preprocess()
    processor.text = "bar: baz"
    processor.postprocess()

    equal(processor.text, "bar: baz")
  })

  test("should hide and restore helm values when useHelmProcessor = true", () => {
    const processor = new ProcessorPipeline("foo: {{ .Value }}\nbar: baz")

    processor.preprocess()

    equal(processor.text, "foo: vscode-yaml-sort.helm.0\nbar: baz")
  })

  test("should leave helm values alone when useHelmProcessor = false", () => {
    const processor = new ProcessorPipeline("foo: {{ .Value }}", settingsWithout("useHelmProcessor"))

    processor.preprocess()

    equal(processor.text, "foo: {{ .Value }}")
  })

  test("should leave octal values alone when useOctalProcessor = false", () => {
    const processor = new ProcessorPipeline("foo: 0644", settingsWithout("useOctalProcessor"))

    processor.preprocess()

    equal(processor.text, "foo: 0644")
  })

  test("should hide block scalars when useBlockProcessor = true", () => {
    const processor = new ProcessorPipeline("a: |\n  text")

    processor.preprocess()

    ok(processor.text.startsWith("a: vscode-yaml-sort.block.0"))
  })

  test("should restore the values in reverse order, so nested substitutes are resolved", () => {
    // the helm value is inside the array, which the array processor hides first
    const text = "a: [ \"{{ .Value }}\", b ]"
    const processor = new ProcessorPipeline(text)

    processor.preprocess()
    processor.postprocess()

    equal(processor.text, text)
  })

  test("GitHub issue #164: Comment processor duplicates comments inside block scalars", () => {
    const text =
      "block:\n" +
      "  - |\n" +
      "    # comment 1\n" +
      "    some command\n" +
      "    # comment 2\n" +
      "    some other command"
    const processor = new ProcessorPipeline(text)

    processor.preprocess()
    processor.postprocess()

    equal(processor.text, text)
  })
})
