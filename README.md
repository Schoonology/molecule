# Molecule

Molecule is a tiny framework for composing systems (called "Atoms") into process groups (configured as "Recipes" and run as "Molecules") that comunicate with each other by passing messages ("Electrons") from system to system through a specific interface of handlers ("Nuclei") and emitters ("Electrons").

## Readiness

Molecule is still in early development. Even this documentation is fresh, and needs to be iterated over.

## Design Philosophy

 * Flexibility First, Fallbacks Second - Everything about Molecule is driven by its configuration. Where I thought it
 sensical, I've provided fallback values, even as far as the configuration itself is concerned, using
 [rc](https://npmjs.org/package/rc) and [localrc](https://npmjs.org/package/localrc) to load as much of an obvious
 configuration as possible. That said, nothing is done for you that cannot be replaced obviously and with the right
 configuration.
 * Barefoot Programming - Even a concept as core to making Molecule useful as the Control Atom uses all the same methods
 that Molecule users are expected to use. Some people call it "eating your own dogfood".

## License

Copyright (C) 2013 Michael Schoonmaker (michael.r.schoonmaker@gmail.com)

This project is free software released under the MIT/X11 license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
