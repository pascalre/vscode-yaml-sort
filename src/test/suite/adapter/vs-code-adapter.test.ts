import { fail, equal } from "assert"
import path = require("path")
import { Uri, workspace, window } from "vscode"
import { spy } from "sinon"
import { Severity, VsCodeAdapter } from "../../../adapter/vs-code-adapter"

suite("Test VsCodeAdapter - getProperty()", () => {
  const vscodeadapter = new VsCodeAdapter()

  test("when property is locale should return en", () => {
    equal(vscodeadapter.getProperty("locale"), "en")
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

      equal(VsCodeAdapter.getActiveDocument(window.activeTextEditor), expected)
    } else {
      fail("window.activeTextEditor is not set")
    }
  })
})

suite("Test VsCodeAdapter - showMessage()", () => {
  const vscodeadapter = new VsCodeAdapter()
  test("when Severity.ERROR should show error message", () => {
    const spyError = spy(window, "showErrorMessage")
    equal(spyError.called, false)
    vscodeadapter.showMessage(Severity.ERROR, "Test message")
    equal(spyError.called, true)
  })

  test("when Severity.INFO should show info message", () => {
    const spyNotify = spy(vscodeadapter, "notify")
    equal(spyNotify.called, false)
    vscodeadapter.showMessage(Severity.INFO, "Test message")
    equal(spyNotify.called, true)
  })
})

suite("Test VsCodeAdapter - notify()", () => {
  test("when notifySuccess should show info message", () => {
    const vscodeadapter = new VsCodeAdapter()
    const spyObject = spy(window, "showInformationMessage")

    vscodeadapter.settings.notifySuccess = false
    vscodeadapter.notify("Test message")
    equal(spyObject.called, false)

    vscodeadapter.settings.notifySuccess = true
    vscodeadapter.notify("Test message")
    equal(spyObject.called, true)
  })
})
