import { ConfigurationScope, WorkspaceConfiguration, workspace } from "vscode"

import { Settings } from "../core/settings"

export type ConfigurationProvider = (section: string, scope?: ConfigurationScope) => WorkspaceConfiguration

/**
 * Reads the settings that apply to a document: workspace folder settings in a multi-root
 * workspace and language specific settings like `"[yaml]": { "vscode-yaml-sort.indent": 4 }`.
 * @param scope            The document, or its uri and language id. Undefined reads the global and workspace settings.
 * @param getConfiguration Injectable for tests.
 * @returns A snapshot of the settings.
 */
export const readSettings = (
  scope?: ConfigurationScope,
  getConfiguration: ConfigurationProvider = workspace.getConfiguration
): Settings => new Settings(getConfiguration(Settings.SECTION, scope))
