import { Severity, VsCodeAdapter } from "./vs-code-adapter"

/**
 * Shows errors from the core to the user.
 */
export class ErrorReporter {
  vsCodeAdapter = new VsCodeAdapter()

  /**
   * @param error Anything that was thrown. Values that are no Error are shown as text,
   *              so no failure goes unnoticed.
   */
  handleError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    this.vsCodeAdapter.showMessage(Severity.ERROR, message)
  }
}
