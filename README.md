# Why?

One of the strenghts of the Javascript world is that it gives us access to an infinite ecosystem of modules. This great flexibility of course comes with many risks: your project could become tied to libraries that provide no guarantees, that are maintaned by developers in their spare time, that could become unsupported at any time, that don't have the possiblity to promptly receive fixes when a bug or exploit is found in their code.

Other languages solve this problem by embedding most functionality in the core or by relying on well-know organisations, but if we are to safeguard the plurality that made the Javascript community what it is today, we should look for a different solution.


# What is `proven`?

`proven` is a CLI tool to enforce module quality requirements for the dependencies in your project. With `proven` you can easily implement a set of rules that third-party modules must withstand to be accepted as dependencies in your projects.

`proven` will go through all the dependencies in your project and give you warnings if it finds that any of the modules being used are obsolete, or not being actively maintained, or don't have a big enough community taking care of them, or yet if they make use of modules not compatible with your rules.


# Documentation

## CLI options

By default, only the modules listed in the `dependencies` field of the package.json file will be checked.

 - `d, --directory <dir>` Scan the target directory instead of the CWD
 - `-c, --config <config>` Load the specified config file instead of the default one
 - `-r, --recursive <depth>` Check dependencies recursively up to a certain depth
 - `-s, --silent` Produce exit code 0 in case of failure
 - `--skip-deps` Don't check modules listed in `dependencies`
 - `--check-dev-deps` Check modules listed in `devDependencies`


## .provenrc file

This is the default configuration file that tells `proven` what criterias and limits you want to enforce.

It must be specified in JSON format, such as:

`{
    "maxAge": 300,
    "minMaintainers": 1,
    "minVersions": 5,
    "repoRequired": true,
    "allowedLicenses": "any spdx"
}`

If the file is specified, all fields must be provided.


### `maxAge`

`number`

Specifies the max number of days since last publication.

### `minMaintainers`

`number`

Specifies the minimum amount of contributors. Setting a number greater than 1 in this field helps reducing the [Bus Factor](https://en.wikipedia.org/wiki/Bus_factor).

### `minVersions`

`number`

Minimum amount of times the project has been updated.

### `repoRequired`

`true` or `false`

Whether the repository field has been provided.

### `allowedLicenses`

`array` or `string`

It can either be:
 - an array with the list of SPDX licenses to be considered valid;
 - a string with the value `any spdx` to accept any valid SPDX expression;
 - or a string with the value `any` to accept any value.


## .provenignore file

This file can be used to list modules that you want to "allow" regardless of their quality assessment. `proven` will never yield a warning for a module listed in this file.
