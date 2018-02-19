# What is `proven`?

`proven` is a CLI tool to enforce module quality requirements for the dependencies in your project. With `proven` you can easily implement a set of rules that third-party modules must withstand to be accepted as dependencies in your projects.

`proven` will go through all the dependencies in your project and give you warnings if it finds that any of the modules being used are obsolete, or not being actively maintained, or don't have a big enough community taking care of them, or yet if they make use of modules not compatible with your rules.


## .proven file

This is the default configuration file that tells `proven` what criterias you want to enforce.


## .provenignore file

This file can be used to list modules that you want to "allow" regardless of their quality assessment. `proven` will never yeld a warning for a module listed in this file.
