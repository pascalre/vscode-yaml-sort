import * as assert from "assert"
import path = require("path")
import * as vscode from "vscode"
import { VsCodeAdapter } from "../../../adapter/vs-code-adapter"

suite("Test VsCodeAdapter - getProperty()", () => {
  const vscodeadapter = new VsCodeAdapter()

  test("when property is locale should return en", () => {
    assert.strictEqual(vscodeadapter.getProperty("locale"), "en")
  })
})
/*
suite("Test VsCodeAdapter - applyEdits()", () => {
  const vscodeadapter = new VsCodeAdapter()
  const textEditor = vscode.window.activeTextEditor
  if (textEditor) {
    const edits = vscodeadapter.getEdits(textEditor, 'foobar')
    vscode.window.activeTextEditor = undefined
    assert.throws(() => vscodeadapter.applyEdits([edits]))
  
    test("when property is locale should return en", () => {
      assert.strictEqual(vscodeadapter.getProperty("locale"), "en")
    })
  }
})*/

suite("Test VsCodeAdapter - getActiveDocument()", () => {
  test("when text editor is active should open document", async () => {
    const uri = vscode.Uri.parse(path.resolve("./src/test/files/getYamlFilesInDirectory/file.yaml"))
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: false })

    if (vscode.window.activeTextEditor) {
      const expected =
        'key:\n' +
        '  key2: value'

      assert.strictEqual(new VsCodeAdapter().getActiveDocument(vscode.window.activeTextEditor), expected)
    } else {
      assert.fail("vscode.window.activeTextEditor is not set")
    }
  })
})