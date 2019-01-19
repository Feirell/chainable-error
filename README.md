# chainable-error

This package is meant to fill a gap till ECMAScript / JavaScript adopts some kind of API to chain Error A as cause for Error B.

## limitations

This package should be used with care, since ECMAScript does not define the stack trace format or any way of manipulating it (see [this stackoverflow answer](https://stackoverflow.com/a/54270910/3647724) for more information). This package will only work for V8 or V8 similar engines which produce the shown stack trace. Otherwise the functions and classes provided will be just stubs with do no chaining.

## usage

You can use this package in three ways:

### replacing the global Error object

```js
require('chainable-error').replaceOriginalWithChained();

function someErrorThrowingFunction() {
    throw new Error("Some Message");
}

function testOtherFnc() {
    try {
        someErrorThrowingFunction();
    } catch (e) {
        throw new Error("Some new Message", e);
    }
}

testOtherFnc();
```

### importing the chainable error

```js
const ChainableError = require('chainable-error').Error;

function someErrorThrowingFunction() {
    throw new ChainableError("Some Message");
}

function testOtherFnc() {
    try {
        someErrorThrowingFunction();
    } catch (e) {
        throw new ChainableError("Some new Message", e);
    }
}

testOtherFnc();
```

### using the `chainErrors` function

```js
const chainErrors = require('chainable-error').chainErrors;

function someErrorThrowingFunction() {
    throw new Error("Some Message");
}

function testOtherFnc() {
    try {
        someErrorThrowingFunction();
    } catch (e) {
        throw chainErrors(e, new Error("Some new Message"));
    }
}

testOtherFnc();
```


All three methods produce the same (in NodeJS v10) output, just the second line differs:

```text
/path/to/file/script.js:11
        throw new Error("Some new Message", e);
        ^

Error: Some new Message
    at testOtherFnc (/path/to/file/script.js:11:15)
    at Object.<anonymous> (/path/to/file/script.js:15:1)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)
Caused by: Error: Some Message
    at someErrorThrowingFunction (/path/to/file/script.js:4:11)
    at testOtherFnc (/path/to/file/script.js:9:9)
    at Object.<anonymous> (/path/to/file/script.js:15:1)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
```

## styling

You can configure the output generated when chaining with non Error objects:

```js
const chainErrors = require('chainable-error').chainErrors;

function someErrorThrowingFunction() {
    throw { a: 12, 2: "some string", b() { return "hi" } };
}

function testOtherFnc() {
    try {
        someErrorThrowingFunction();
    } catch (e) {
        throw chainErrors(e, new Error("Some new Message"));
    }
}

testOtherFnc();
```

Which will print:

```text
/path/to/file/script.js:11
        throw chainErrors(e, new Error("Some new Message"));
        ^

Error: Some new Message
    at testOtherFnc (/path/to/file/script.js:11:30)
    at Object.<anonymous> (/path/to/file/script.js:15:1)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)
Was caused by throwing:
    {
        "2": "some string",
        "a": 12
    }
```

To change the default behaviour just set the formatFunction property:

```js
const ce = require('chainable-error');

const chainErrors = ce.chainErrors;
ce.formatFunction = v => "Value: " + v;

function someErrorThrowingFunction() {
    throw { a: 12, 2: "some string", b() { return "hi" } };
}

function testOtherFnc() {
    try {
        someErrorThrowingFunction();
    } catch (e) {
        throw chainErrors(e, new Error("Some new Message"));
    }
}

testOtherFnc();
```

Which will print:

```text
/path/to/file/script.js:14
        throw chainErrors(e, new Error("Some new Message"));
        ^

Error: Some new Message
    at testOtherFnc (/path/to/file/script.js:14:30)
    at Object.<anonymous> (/path/to/file/script.js:18:1)
    at Module._compile (internal/modules/cjs/loader.js:688:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:699:10)
    at Module.load (internal/modules/cjs/loader.js:598:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:537:12)
    at Function.Module._load (internal/modules/cjs/loader.js:529:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:741:12)
    at startup (internal/bootstrap/node.js:285:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:739:3)
Was caused by throwing:
    Value: [object Object]
```

The default formatFunction is `v => JSON.stringify(v, undefined, 4)`.