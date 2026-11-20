import { equal, fail } from "assert"
import { resolve } from "path"

import { spy } from "sinon"
import { Uri, window, workspace } from "vscode"

import { Severity, VsCodeAdapter } from "../../vscode/vs-code-adapter"

suite("Test VsCodeAdapter - getActiveDocument()", () => {
  test("when text editor is active should open document", async () => {
    const uri = Uri.parse(resolve("./src/test/files/testGetActiveDocument.yaml"))
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc, { preview: false })

    if (window.activeTextEditor) {
      const expected =
        "key:\n" +
        "  key2: value"

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
