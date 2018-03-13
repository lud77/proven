## Works in progress

Work just started on this module, so don't expect it ot actually work for the time being.


# Why?

One of the strenghts of the Javascript world is that it gives us access to an infinite ecosystem of modules. This great flexibility of course comes with many risks: your project could become tied to libraries that provide no guarantees, that are maintaned by developers in their spare time, that could become unsupported at any time, that don't have the possiblity to promptly receive fixes when a bug or exploit is found in their code.

Other languages solve this problem by embedding most functionality in the core or by relying on well-know organisations, but if we are to safeguard the plurality that made the Javascript community what it is today, we must find a different solution.


# What is `proven`?

`proven` is a CLI tool to enforce module quality requirements for the dependencies in your project. With `proven` you can easily implement a set of rules that third-party modules must withstand to be accepted as dependencies in your projects.

`proven` will go through all the dependencies in your project and give you warnings if it finds that any of the modules being used are obsolete, or not being actively maintained, or don't have a big enough community taking care of them, or yet if they make use of modules not compatible with your rules.


## .provenrc file

This is the default configuration file that tells `proven` what criterias and limits you want to enforce.


## .provenignore file

This file can be used to list modules that you want to "allow" regardless of their quality assessment. `proven` will never yield a warning for a module listed in this file.
