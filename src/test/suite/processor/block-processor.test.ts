import { equal } from "assert"

import { BlockProcessor } from "../../../processor/block-processor"

suite("Test BlockProcessor - preprocess()", () => {
  test("input string with block sequence > should be the same after pre and postprocessing", () => {
    const text =
      "foo:\n" +
      "  bar: >\n" +
      "    This is a long sentence\n" +
      "baz: bar"
  
    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)

    blockprocessor.postprocess()
    
    equal(blockprocessor.text, text)
  })

  test("input string with block sequence | should be the same after pre and postprocessing", () => {
    const text =
      "foo:\n" +
      "  bar: |\n" +
      "    This is a long sentence\n" +
      "    over two lines\n" +
      "baz: bar"

    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)

    /* todo: this test should be fixed
    const expected =
      "|\n" +
      "    This is a long sentence\n" +
      "    over two lines"

    equal(blockprocessor.store.get("vscode-yaml-sort.block.0"), expected)
    */

    blockprocessor.postprocess()

    equal(blockprocessor.text, text)
  })

  test("GitHub issue #126: YAML with HTML tags breaks in v6.5.0", () => {
    const text = "html_label: this is <span>html</span>"

    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 0)
  })

  test("GitHub issue #134: Do not match trailing keyword", () => {
    const text =
      "body: |\n" +
      "  lorem ipsum 1\n" +
      "subject: lorem ipsum 2"
    const match =
      "|\n" +
      "  lorem ipsum 1"

    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)
    equal(blockprocessor.store.get("vscode-yaml-sort.block.0"), match)
  })
})

suite("Test BlockProcessor - block scalars with special characters", () => {
  const blockScalarCases: { content: string, hiddenMarker: string }[] = [
    {
      // GitHub issue #188: colons in a block scalar
      content: "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nnamespace: monitor\nresources:\n  - bundle.yaml\n\npatches:\n  - target:\n      kind: ClusterRoleBinding\n      name: prometheus-operator\n    patch: |-\n      - op: replace\n        path: /subjects/0/namespace\n        value: monitor",
      hiddenMarker: "- op: replace"
    },
    {
      // GitHub issue #227: comment-like lines in a block scalar
      content: "'!': |\n    #####################################\n    ##\n    ## Zeta:\n    ##     - C\n    ##     - A\n    ##     - B\n    ## Beta:\n    ##     - B\n    ##     - C\n    ##     - A\n    ## Alpha:\n    ##     - A\n    ##     - B\n    ##     - C\n    ##\n    #####################################\n\nZeta:\n    - C\n    - A\n    - B\nBeta:\n    - B\n    - C\n    - A\nAlpha:\n    - A\n    - B\n    - C",
      hiddenMarker: "## Zeta:"
    }
  ]

  blockScalarCases.forEach(({ content, hiddenMarker }) => {
    test("pre and postprocessing should restore the original text", () => {
      const processor = new BlockProcessor(content)

      processor.preprocess()

      equal(processor.store.size, 1)
      equal(processor.text.includes(hiddenMarker), false)

      processor.postprocess()

      equal(processor.text, content)
    })
  })
})