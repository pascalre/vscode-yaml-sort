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
suite("Test BlockProcessor - GitHub issue #188", () => {
  test("should keep a block scalar containing colons intact", () => {
    const text = "apiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nnamespace: monitor\nresources:\n  - bundle.yaml\n\npatches:\n  - target:\n      kind: ClusterRoleBinding\n      name: prometheus-operator\n    patch: |-\n      - op: replace\n        path: /subjects/0/namespace\n        value: monitor"
    const blockprocessor = new BlockProcessor(text)

    blockprocessor.preprocess()

    equal(blockprocessor.store.size, 1)
    equal(blockprocessor.text.includes("patch: vscode-yaml-sort.block.0"), true)
    equal(blockprocessor.text.includes("- op: replace"), false)

    blockprocessor.postprocess()

    equal(blockprocessor.text, text)
  })

  test("should keep a block scalar containing comment-like lines intact (GitHub issue #227)", () => {
    const text = "'!': |\n    #####################################\n    ##\n    ## Zeta:\n    ##     - C\n    ###########"222222222222222222222222225ÆåÆå¦WF¥ÆâÒ2 ¢6öç7B&Æö6·&ö6W76÷"ÒæWr&Æö6µ&ö6W76÷"FWB ¢&Æö6·&ö6W76÷"ç&W&ö6W72 ¢WVÂ&Æö6·&ö6W76÷"ç7F÷&Rç6¦RÂ ¢&Æö6·&ö6W76÷"ç÷7G&ö6W72 ¢WVÂ&Æö6·&ö6W76÷"çFWBÂFWB¢Ò§Ò 