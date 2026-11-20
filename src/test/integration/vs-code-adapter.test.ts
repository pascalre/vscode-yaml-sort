import { equal } from "assert"

import { spy } from "sinon"
import { window, workspace } from "vscode"

import { Severity, VsCodeAdapter } from "../../vscode/vs-code-adapter"

suite("Test VsCodeAdapter - getFullDocumentRange()", () => {
  test("should cover the whole document", async () => {
    const document = await workspace.openTextDocument({ language: "yaml", content: "a: 1\nb: 2\n" })

    equal(document.getText(VsCodeAdapter.getFullDocumentRange(document)), "a: 1\nb: 2\n")
  })
})

suite("Test VsCodeAdapter - showMessage()", () => {
  const vsCodeAdapter = new VsCodeAdapter()
  test("when Severity.ERROR should show error message", () => {
    const spyError = spy(window, "showErrorMessage")
    equal(spyError.called, false)
    vsCodeAdapter.showMessage(Severity.ERROR, "Test message")
    equal(spyError.called, true)
  })

  test("when Severity.INFO should show info message", () => {
    const spyNotify = spy(vsCodeAdapter, "notify")
    equal(spyNotify.called, false)
    vsCodeAdapter.showMessage(Severity.INFO, "Test message")
    equal(spyNotify.called, true)
  })
})

suite("Test VsCodeAdapter - notify()", () => {
  test("when notifySuccess should show info message", () => {
    const vsCodeAdapter = new VsCodeAdapter()
    const spyObject = spy(window, "showInformationMessage")

    vsCodeAdapter.settings.notifySuccess = false
    vsCodeAdapter.notify("Test message")
    equal(spyObject.called, false)

    vsCodeAdapter.settings.notifySuccess = true
    vsCodeAdapter.notify("Test message")
    equal(spyObject.called, true)
  })
})
