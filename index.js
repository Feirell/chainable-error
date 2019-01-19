"use strict";
{
    const glob = (() => { try { return window; } catch (e) { return global; } })();

    const isErrorExtensible = (() => {
        try {
            // making sure this is an js engine which creates "extensible" error stacks (i.e. not firefox)
            const stack = (new glob.Error('Test String')).stack;
            return stack.slice(0, 26) == 'Error: Test String\n    at ';
        } catch (e) { return false; }
    })();

    const OriginalError = glob.Error;

    const exporting = {
        Error: OriginalError,
        OriginalError,
        chainErrors: (e1, e2) => e2,
        replaceOriginalWithChained: () => { },
        replaceChainedWithOriginal: () => { },
        formatFunction: v => v
    };

    if (isErrorExtensible) {
        let ff = v => JSON.stringify(v, undefined, 4);
        const formatForOutput = v => {
            try {
                return ff(v).replace(/\n/g, '\n    ');
            } catch (e) {
                return "" + v;
            }
        };

        const chainErrors = exporting.chainErrors = (e1, e2) => {
            if (e1 instanceof OriginalError)
                e2.stack += '\nCaused by: ' + e1.stack;
            else
                e2.stack += '\nWas caused by throwing:\n    ' + formatForOutput(e1);

            return e2;
        }

        class Error extends OriginalError {
            constructor(msg, chained) {
                super(msg);

                if (arguments.length > 1)
                    chainErrors(chained, this);
            }
        }

        exporting.Error = Error;

        exporting.replaceOriginalWithChained = () => {
            if (glob.Error != Error)
                glob.Error = Error;
        }

        exporting.replaceChainedWithOriginal = () => {
            if (glob.Error == Error)
                glob.Error = OriginalError;
        }

        Object.defineProperty(exporting, 'formatFunction', {
            get: () => ff,
            set: v => {
                if (typeof v != 'function') throw new TypeError('the function for formatFunction has to by of type function but was ' + v)
                ff = v;
            }
        });
    }

    module.exports = Object.freeze(exporting);
}