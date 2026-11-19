import { deepEqual, equal } from "assert"

import { window, workspace } from "vscode"

import { YamlFormattingProvider } from "../../../controller/formatting-provider"

suite("Test YamlFormattingProvider - provideDocumentFormattingEdits()", () => {
  const provider = new YamlFormattingProvider()

  test("should return one edit replacing the whole document with the sorted text", async () => {
    const document = await workspace.openTextDocument({ language: "yaml", content: "b: 1\na: 2\n" })

    const edits = provider.provideDocumentFormattingEdits(document)

    equal(edits.length, 1)
    equal(edits[0].newText, "---\na: 2\nb: 1")
    deepEqual(edits[0].range, document.validateRange(edits[0].range))
    equal(edits[0].range.start.line, 0)
    equal(edits[0].range.end.line, document.lineCount - 1)
  })

  test("should not apply the edits itself, VS Code does that (#180)", async () => {
    const content = "b: 1\na: 2"
    const document = await workspace.openTextDocument({ language: "yaml", content })
    // the old formatter applied its edits to the active editor, so make the document active
    await window.showTextDocument(document, { preview: false })

    provider.provideDocumentFormattingEdits(document)
    // a self-applied edit would show up asynchronously, so give it a chance to happen
    await new Promise((resolve) => setTimeout(resolve, 500))

    equal(document.getText(), content)
  })

  test("should process the given document, not the active editor", async () => {
    const active = await workspace.openTextDocument({ language: "yaml", content: "active: 1" })
    await window.showTextDocument(active, { preview: false })
    const other = await workspace.openTextDocument({ language: "yaml", content: "d: 1\nc: 2" })

    const edits = provider.provideDocumentFormattingEdits(other)

    equal(edits[0].newText, "---\nc: 2\nd: 1")
  })

  test("should return no edits for invalid yaml", async () => {
    const document = await workspace.openTextDocument({ language: "yaml", content: "a: [" })

    deepEqual(provider.provideDocumentFormattingEdits(document), [])
  })
})
