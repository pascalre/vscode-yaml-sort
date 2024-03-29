import { equal, notEqual } from "assert"

import { ProcessorController } from "../../../controller/processor-controller"

suite("Test ProcessorController - preprocess() & postprocess()", () => {
  test("text should be the same after pre- and postprocessing", () => {
    const text =
      "foo: {{ .Value }}\n" +
      "# comment\n" +
      "bar: baz"
    const processor = new ProcessorController(text)

    processor.preprocess()

    notEqual(processor.text, text)

    const text2 =
      "foo: {{ .Value }}\n" +
      "bar: baz"
    processor.text = text2
    processor.postprocess()

    equal(processor.text, text)
  })

  test("test setting useArrayProcessor = true", () => {
    const text = "test: [ \"CMD\", \"pg_isready\", \"-q\", \"-d\", \"DB_NAME\", \"-U\", \"DB_USER\" ]"
    const processor = new ProcessorController(text)

    processor.preprocess()

    equal(processor.arrayprocessor.store.size, 1)
  })
  test("test setting useArrayProcessor = false", () => {
    let text = "test: [ \"CMD\", \"pg_isready\", \"-q\", \"-d\", \"DB_NAME\", \"-U\", \"DB_USER\" ]"
    const processor = new ProcessorController(text)
    processor.settings.useArrayProcessor = false

    processor.preprocess()

    equal(processor.arrayprocessor, undefined)

    text = "test: vscode-yaml-sort.array.0"
    processor.text = text

    processor.postprocess()

    equal(processor.text, text)
  })

  test("test setting useCommentProcessor = true", () => {
    const text =
      "# comment\n" +
      "bar: baz"
    const processor = new ProcessorController(text)

    processor.preprocess()

    equal(processor.commentprocessor.store.length, 1)
  })
  test("test setting useCommentProcessor = false", () => {
    const text =
      "# comment\n" +
      "bar: baz"
    const processor = new ProcessorController(text)
    processor.settings.useCommentProcessor = false

    processor.preprocess()

    equal(processor.commentprocessor, undefined)

    processor.text = "bar: baz"
    processor.postprocess()

    notEqual(processor.text, text)
  })

  test("test setting useHelmProcessor = true", () => {
    const text =
      "foo: {{ .Value }}\n" +
      "bar: baz"
    const processor = new ProcessorController(text)

    processor.preprocess()

    equal(processor.helmprocessor.store.size, 1)
  })
  test("test setting useHelmProcessor = false", () => {
    let text = "foo: {{ .Value }}"
    const processor = new ProcessorController(text)
    processor.settings.useHelmProcessor = false

    processor.preprocess()

    equal(processor.helmprocessor, undefined)

    text = "foo: vscode-yaml-sort.helm.0"
    processor.text = text

    processor.postprocess()

    equal(processor.text, text)
  })

  test("test setting useHelmProcessor = true", () => {
    const text =
      "foo: {{ .Value }}\n" +
      "bar: baz"
    const processor = new ProcessorController(text)

    processor.preprocess()

    equal(processor.helmprocessor.store.size, 1)
  })

  test("test setting useOctalProcessor = false", () => {
    let text = "foo: 0644"
    const processor = new ProcessorController(text)
    processor.settings.useOctalProcessor = false

    processor.preprocess()

    equal(processor.octalprocessor, undefined)

    text = "foo: vscode-yaml-sort.octal.0"
    processor.text = text

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
      const processor = new ProcessorController(text)

      processor.preprocess()
      processor.postprocess()

      equal(processor.text, text)

    })
})
