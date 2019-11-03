# YAML Sort
This VS Code extension exposes the possibility to sort, format and validate YAML files.

## Configuration
This extension contributes the following settings:

* `vscode-yaml-sort.indent`: Indentation width in spaces.
* `vscode-yaml-sort.lineWidth`: Maximum line width for YAML files. Defaults to 500.
* `vscode-yaml-sort.noArrayIndent`: When true, will not add an indentation level to array elements. Defaults to false.
* `vscode-yaml-sort.useLeadingDashes`: When true, sorted YAML files begin with leading dashes. Defaults to true.
* `vscode-yaml-sort.useQuotesForSpecialKeywords`: When false, will not add quotes for special keywords e.g. 'puppet::key': will result in puppet::key:. Defaults to true.
* `vscode-yaml-sort.customSortKeywords_1`: List of keywords for `Custom Sort 1`. Defaults to `["apiVersion", "kind", "metadata", "spec", "data"]`.
* `vscode-yaml-sort.customSortKeywords_2`: List of keywords for `Custom Sort 2`.
* `vscode-yaml-sort.customSortKeywords_3`: List of keywords for `Custom Sort 3`.

## Commands
This extension contributes the following commands:

* `Sort YAML`: Sorts a given YAML. You can either sort the whole YAML document or sort only a selection of the text.
* `Validate YAML`: Validates a given YAML.
* `Format YAML`: Formats a given YAML without sorting it.
* `Custom Sort 1`: This command will sort a given YAML with custom order. If some of the keys of `customSortKeywords_1` will be found at the top level of the YAML, these will be put at the beginning of the YAML file (in the given order). You can use this e. g. to sort Kubernetes configmaps.
* `Custom Sort 2`: Same as `Custom Sort 1`.
* `Custom Sort 3`: Same as `Custom Sort 1`.

## Known problems
Be careful with anchors and references, these don't work very well in this extension.

## Changelog
### 2.2.0
* New command `Format YAML`
* New configuration `noArrayIndent`
* New configuration `useQuotesForSpecialKeywords`
* Refactored code and add more test cases

### 2.1.0
This version adds the possibility to sort only a selection.

### 2.0.1
This version fixes the data type of `customSortKeywords`.

### 2.0.0
The command `Sort Kubernetes Configmap` is no longer supported. You can use `Custom Sort 1` instead with the defaults of `vscode-yaml-sort.customSortKeywords_1`.

**Enjoy!**

If you like this extension, please feel free to rate it on the marketplace.
If you miss something or found a bug, please let me know and [open an issue](https://github.com/pascalre/vscode-yaml-sort/issues/new) on this project on GitHub.
