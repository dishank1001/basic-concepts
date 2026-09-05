function debounce(fn, wait, options) {
  const { leading = false, trailing = true } = options || {};

  let timer;
  let lastArgs;
  let lastThis;
  let pending = false;   // is a trailing invocation owed?

  const invoke = () => {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    pending = false;
    return fn.apply(thisArg, args);
  };

  const startTimer = () => {
    timer = setTimeout(() => {
      try {
        if (trailing && pending) invoke();
      } finally {
        timer = undefined;
        pending = false;
      }
    }, wait);
  };

  const wrapper = function (...args) {
    lastArgs = args;
    lastThis = this;

    const isFirstCall = timer === undefined;
    clearTimeout(timer);

    if (isFirstCall && leading) {
      invoke();           // consumes this call; pending stays false
    } else {
      pending = true;     // this call is owed a trailing invocation
    }

    startTimer();
  };

  wrapper.cancel = function () {
    clearTimeout(timer);
    timer = undefined;
    pending = false;
    lastArgs = undefined;
    lastThis = undefined;
  };

  wrapper.flush = function () {
    if (timer === undefined) return undefined;
    clearTimeout(timer);
    timer = undefined;
    return (trailing && pending) ? invoke() : undefined;
  };

  wrapper.pending = () => timer !== undefined;

  return wrapper;
}