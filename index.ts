const glob = (() => {
  try {
    return window;
  } catch (e) {
    // @ts-ignore-next-line
    return global;
  }
})();

const isErrorExtensible = (() => {
  try {
    // making sure this is an js engine which creates "extensible" error stacks (i.e. not firefox)
    const stack = new glob.Error("Test String").stack;
    return stack.slice(0, 26) == "Error: Test String\n    at ";
  } catch (e) {
    return false;
  }
})();

export const OriginalError = glob.Error as ErrorConstructor;

interface FormatFunction {
  (type: any): string;
}

let ff: FormatFunction = v => JSON.stringify(v, undefined, 4);

export const getFormatFunction = (): FormatFunction => ff;

export const setFormatFunction = (newFormatFunction: FormatFunction) => {
  if (typeof newFormatFunction != "function")
    throw new TypeError(
      "the function for formatFunction has to by of type function but was " +
        newFormatFunction
    );
  ff = newFormatFunction;
};

const formatForOutput = (v: string) => {
  try {
    return ff(v).replace(/\n/g, "\n    ");
  } catch (e) {
    return "" + v;
  }
};

const chainErrorsFunction = (e1: Error, e2: Error) => {
  if (e1 instanceof OriginalError) e2.stack += "\nCaused by: " + e1.stack;
  else e2.stack += "\nWas caused by throwing:\n    " + formatForOutput(e1);

  return e2;
};

export const chainErrors = !isErrorExtensible
  ? (e1: Error, e2: Error) => e2
  : chainErrorsFunction;

class ExtensibleError extends OriginalError {
  constructor(msg: string, chained: Error) {
    super(msg);

    if (arguments.length > 1) chainErrors(chained, this);
  }
}

export const Error: typeof ExtensibleError = !isErrorExtensible
  ? OriginalError
  : ExtensibleError;

export const replaceChainedWithOriginal = !isErrorExtensible
  ? () => {}
  : () => {
      if (glob.Error == Error) glob.Error = OriginalError;
    };

export const replaceOriginalWithChained = !isErrorExtensible
  ? () => {}
  : () => {
      if (glob.Error != Error) glob.Error = Error;
    };
