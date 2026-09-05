function debounce(fn, wait, options) {
  const { leading = false, trailing = true } = options || {};

  let timer;
  let lastArgs;
  let lastThis;

  const invoke = () => {
    const result = fn.call(lastThis, ...lastArgs);

    lastArgs = undefined;
    lastThis = undefined;

    return result;
  };

  const wrapper = function (...args) {
    lastArgs = args;
    lastThis = this;

    const isFirstCall = timer === undefined;

    clearTimeout(timer);

    if (isFirstCall && leading) {
      invoke();
    }

    timer = setTimeout(() => {
      if (trailing && lastArgs) {
        invoke();
      }

      timer = undefined;
    }, wait);
  };

  wrapper.cancel = function () {
    clearTimeout(timer);

    timer = undefined;
    lastArgs = undefined;
    lastThis = undefined;
  };

  wrapper.flush = function () {
    if (timer === undefined) {
      return;
    }

    clearTimeout(timer);

    timer = undefined;

    if (trailing && lastArgs) {
      return invoke();
    }

    lastArgs = undefined;
    lastThis = undefined;
  };

  return wrapper;
}
