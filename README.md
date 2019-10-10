# YAML Sort

This VS Code extension exposes the possibility to sort and validate yaml files.

## Configuration

This extension contributes the following settings:

* `vscode-yaml-sort.indent`: Indentation width in spaces.
* `vscode-yaml-sort.lineWidth`: Maximum line width for YAML files. Defaults to 500.
* `vscode-yaml-sort.useLeadingDashes`: Define if sorted YAML files should begin with leading dashes. Defaults to true.
* `vscode-yaml-sort.customSortKeywords_1`: List of keywords for `Custom Sort 1`. Defaults to ["apiVersion", "kind", "metadata", "spec", "data"].
* `vscode-yaml-sort.customSortKeywords_2`: List of keywords for `Custom Sort 2`.
* `vscode-yaml-sort.customSortKeywords_3`: List of keywords for `Custom Sort 3`.

## Commands

This extension contributes the following commands:

* `Sort YAML`: Sorts a given yaml in the current open editor tab
* `Validate YAML`: Validates a given yaml in the current open editor tab
* `Sort Kubernetes Configmap`: Sorts a given Kubernetes configmap ordering the top level keywords as following: apiVersion, kind, metadata, spec, data
* `Custom Sort 1`: This command will sort a given yaml. If some of the keys of customSortKeywords_1 will be found at the top level, these will be put at the beginning of the yaml file (in the given order). You can use this e. g. to sort Kubernetes configmaps.
* `Custom Sort 2`: Same as `Custom Sort 1`.
* `Custom Sort 3`: Same as `Custom Sort 1`.

## New stuff in this version
The command `Sort Kubernetes Configmap` is no longer supported. You can use `Custom Sort 1` instead with the defaults of `vscode-yaml-sort.customSortKeywords_1`.

**Enjoy!**

If you like this extension, please feel free to rate it on the marketplace.
