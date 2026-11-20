import { Severity, VsCodeAdapter } from "./vs-code-adapter"

export class ErrorReporter {
  vsCodeAdapter = new VsCodeAdapter()

  handleError(error: unknown) {
    if (error instanceof Error) {
      this.vsCodeAdapter.showMessage(Severity.ERROR, error.message)
    }
  }
}