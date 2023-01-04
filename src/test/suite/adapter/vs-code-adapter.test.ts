import { strictEqual, fail } from "assert"
import path = require("path")
import { Uri, workspace, window } from "vscode"
import { VsCodeAdapter } from "../../../adapter/vs-code-adapter"

suite("Test VsCodeAdapter - getProperty()", () => {
  const vscodeadapter = new VsCodeAdapter()

  test("when property is locale should return en", () => {
    strictEqual(vscodeadapter.getProperty("locale"), "en")
  })
})
/*
suite("Test VsCodeAdapter - applyEdits()", () => {
  const vscodeadapter = new VsCodeAdapter()
  const textEditor = window.activeTextEditor
  if (textEditor) {
    const edits = vscodeadapter.getEdits(textEditor, 'foobar')
    window.activeTextEditor = undefined
    throws(() => vscodeadapter.applyEdits([edits]))
  
    test("when property is locale should return en", () => {
      strictEqual(vscodeadapter.getProperty("locale"), "en")
    })
  }
})*/

suite("Test VsCodeAdapter - getActiveDocument()", () => {
  test("when text editor is active should open document", async () => {
    const uri = Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    if (window.activeTextEditor) {
      const expected =
        'key:\n' +
        '  key2: value'

      strictEqual(VsCodeAdapter.getActiveDocument(window.activeTextEditor), expected)
    } else {
      fail("window.activeTextEditor is not set")
    }
  })
})