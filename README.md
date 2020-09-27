# YAML Sort
This VS Code extension exposes the possibility to sort, format and validate YAML files.

### Preview
![Preview](images/preview.gif)

## Commands
This extension contributes the following commands:

| Command                                        | Description                                                                                           |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `Sort YAML`                                    | Sorts a given YAML. You can either sort the whole YAML document or sort only a selection of the text. |
| `Validate YAML`                                | Validates a given YAML.                                                                               |
| `Format YAML`                                  | Formats a given YAML without sorting it.                                                              |
| `Custom Sort 1`                                | This command will sort a given YAML with custom order. If some of the keys of `customSortKeywords_1` will be found at the top level of the YAML, these will be put at the beginning of the YAML file (in the given order). You can use this e. g. to sort Kubernetes configmaps. |
| `Custom Sort 2`                                | Same as `Custom Sort 1`                                                                               |
| `Custom Sort 3`                                | Same as `Custom Sort 1`                                                                               |


## Configuration
This extension contributes the following settings:

| Setting                                        | Description                                                                                                        | Default |
|------------------------------------------------|------------------------------------------------------------------------------------------------------------------- | ------- |
| `vscode-yaml-sort.indent`                      | Indentation width in spaces                                                                                        | `2`     |
| `vscode-yaml-sort.lineWidth`                   | Maximum line width for YAML files                                                                                  | `500`   |
| `vscode-yaml-sort.noArrayIndent`               | When true, will not add an indentation level to array elements                                                     | `false` |
| `vscode-yaml-sort.useLeadingDashes`            | When true, sorted YAML files begin with leading dashes                                                             | `true`  |
| `vscode-yaml-sort.useQuotesForSpecialKeywords` | When false, will not add quotes for keywords with special characters e.g. 'text::text': will result in text::text: | `true`  |
| `vscode-yaml-sort.customSortKeywords_1`        | List of keywords for `Custom Sort 1`.                                                                              | `["apiVersion", "kind", "metadata", "spec", "data"]`                       |
| `vscode-yaml-sort.customSortKeywords_2`        | List of keywords for `Custom Sort 2`                                                                               | -       |
| `vscode-yaml-sort.customSortKeywords_3`        | List of keywords for `Custom Sort 3`                                                                               | -       |

## Known problems
Be careful with anchors and references, these don't work very well in this extension.

**Enjoy!**

If you like this extension, please feel free to [rate it](https://marketplace.visualstudio.com/items?itemName=PascalReitermann93.vscode-yaml-sort&ssr=false#review-details) on the marketplace.
If you miss something or found a bug, please let me know and [open an issue](https://github.com/pascalre/vscode-yaml-sort/issues/new) on this project on GitHub.