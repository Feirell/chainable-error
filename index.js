const glob = (() => { try { return window; } catch (e) { return global; } })();

const isErrorExtensible = (() => {
    try {
        // making sure this is an js engine which creates "extensible" error stacks (i.e. not firefox)
        const stack = (new glob.Error('Test String')).stack;
        return stack.slice(0, 26) == 'Error: Test String\n    at ';
    } catch (e) { return false; }
})();

const OriginalError = glob.Error;

if (isErrorExtensible) {
    let ff = v => JSON.stringify(v, undefined, 4);
    const formatForOutput = v => '\n    ' + ff(v).replace(/\n/g, '\n    ');

    const chainErrors = (e1, e2) => {
        if (e1 instanceof OriginalError)
            e2.stack += '\nCaused by: ' + e1.stack;
        else
            e2.stack += '\nWas Caused by throwing:\n' + formatForOutput(e1);

        return e2;
    }

    // an object (could also be a symbol) to be used
    // as default if no value is given(to test wether
    // the value was given or not since null and
    // undefined can be thrown)
    const chainedDef = {};

    class Error extends OriginalError {
        constructor(msg, chained = chainedDef) {
            super(msg);

            if (chained !== chainedDef)
                chainErrors(chained, this);
        }
    }

    const replaceOriginalWithChained = () => {
        if (glob.Error != Error)
            glob.Error = Error;
    }

    const replaceChainedWithOriginal = () => {
        if (glob.Error == Error)
            glob.Error = OriginalError;
    }

    module.exports = {
        Error,
        OriginalError,
        chainErrors,
        replaceOriginalWithChained,
        replaceChainedWithOriginal
    };
} else {
    module.exports = {
        Error: OriginalError,
        OriginalError,
        chainErrors: (e1, e2) => e2,
        replaceOriginalWithChained: () => { },
        replaceChainedWithOriginal: () => { }
    };
}