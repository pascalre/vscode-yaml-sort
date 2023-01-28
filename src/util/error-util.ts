import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"

export class ErrorUtil {
  vscodeadapter = new VsCodeAdapter()

  handleError(error: unknown) {
    if (error instanceof Error) {
      this.vscodeadapter.showMessage(Severity.ERROR, error.message)
    }
  }
}