# JavaScript Debounce — Learning Notes

## 1. What is Debouncing?

**Debouncing means:**

> Don't react immediately. Wait until the activity has stopped for a specified amount of time.

The key mental model:

> **Keep waiting while events keep coming; act when they stop.**

For example, imagine a search box with a debounce period of `500ms`.

Without debounce:

```text
c       → search
ca      → search
cat     → search
cats    → search
```

With debounce:

```text
c       → wait
ca      → reset wait
cat     → reset wait
cats    → reset wait
          ↓
       500ms silence
          ↓
       search("cats")
```

The important detail:

> The `wait` period starts from the **latest event**, not the first event.

---

# 2. Why is Debouncing Useful?

Many user actions generate a large number of events even though they represent one logical action.

Examples:

* Typing into a search box
* Resizing a window
* Scrolling
* Moving a slider
* Changing filters

For example:

```text
j
ja
jav
java
javas
javascr
javascript
```

The application may not want to perform an expensive operation after every single event.

Debouncing converts:

```text
many rapid events
```

into:

```text
one final action
```

after the activity stops.

---

# 3. The Core Debounce Mechanism

A debounce needs two timer operations:

```js
setTimeout()
```

to schedule execution later, and:

```js
clearTimeout()
```

to cancel the previous scheduled execution.

The basic algorithm is:

```text
new event
   ↓
cancel previous timer
   ↓
start new timer
   ↓
wait
   ↓
if no new event arrives
   ↓
execute
```

Every new event postpones execution.

---

# 4. Building a Generic Debounce

We decided our generic API would be:

```js
function debounce(fn, wait, options) {
    // ...
}
```

Where:

* `fn` → function that should eventually execute
* `wait` → quiet period
* `options` → optional configuration

The debounce function itself doesn't execute `fn` immediately.

Instead, it **returns a new function**:

```js
function debounce(fn, wait, options) {
    return function (...args) {
        // debounce logic
    };
}
```

Usage conceptually:

```js
const debouncedSearch = debounce(search, 500);
```

Then:

```js
debouncedSearch("cat");
```

---

# 5. Preserving Arbitrary Arguments

Because a generic debounce should work with functions accepting any number of arguments, we use rest parameters:

```js
return function (...args) {
    // ...
};
```

For:

```js
debouncedSearch("cat", 10, true);
```

we get:

```js
args = ["cat", 10, true]
```

Later, the original function can receive them with:

```js
fn(...args);
```

---

# 6. Why a Closure is Needed

We need to remember the timer between calls.

So instead of declaring the timer inside the returned function:

```js
return function (...args) {
    let timer; // wrong for debounce state
};
```

we declare it in the outer `debounce()` scope:

```js
function debounce(fn, wait, options) {
    let timer;

    return function (...args) {
        // timer is accessible here
    };
}
```

The returned function forms a **closure** over `timer`.

This means every invocation of the returned function accesses the **same timer variable**.

```text
debounce()
   │
   ├── timer
   │
   └── returned function
          │
          ├── call 1 → modifies timer
          ├── call 2 → accesses same timer
          └── call 3 → accesses same timer
```

---

# 7. First Basic Implementation

The core implementation became:

```js
function debounce(fn, wait) {
    let timer;

    return function (...args) {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, wait);
    };
}
```

This is a **trailing-edge debounce**.

For:

```js
debounced("c");
debounced("ca");
debounced("cat");
```

only:

```js
fn("cat");
```

executes after the user stops calling the function for `wait` milliseconds.

---

# 8. Trailing Edge

**Trailing edge** means:

> Execute at the end of the burst of calls.

Example:

```text
call      call      call
 │         │         │
 ▼         ▼         ▼
────────────────────────────
                         │
                         ▼
                     execute()
                     trailing
```

The important rule:

> Trailing execution happens `wait` milliseconds after the **last call**.

---

# 9. Detecting the First Call of a Burst

To support leading-edge execution, we needed to know whether the current call is the first call in the current debounce window.

We used:

```js
timer === undefined
```

as the indicator.

Initially:

```js
let timer;
```

means:

```text
timer === undefined
```

So:

```text
timer === undefined
        ↓
no active debounce window
        ↓
current call is first call of a burst
```

After creating the timer:

```js
timer = setTimeout(...);
```

we have:

```text
timer !== undefined
```

meaning:

```text
we are currently inside a debounce window
```

---

# 10. Resetting the Timer State

When the timeout finishes, the debounce window is over.

Therefore we explicitly reset:

```js
timer = undefined;
```

This gives us an important invariant:

```text
timer === undefined
    → no active debounce window

timer !== undefined
    → debounce window is active
```

---

# 11. Leading Edge

**Leading edge** means:

> Execute immediately at the beginning of the burst.

Conceptually:

```text
first call
   ↓
execute immediately
   ↓
start debounce window
   ↓
ignore subsequent calls during the window
```

We added:

```js
if (timer === undefined && leading) {
    fn(...args);
}
```

So:

```js
leading: true
```

causes the first call of a burst to execute immediately.

---

# 12. Leading and Trailing are Independent

This was an important clarification.

`leading` answers:

> Should the function execute at the **beginning** of the burst?

`trailing` answers:

> Should the function execute at the **end** of the burst?

They are independent.

| leading | trailing | Behavior           |
| ------- | -------- | ------------------ |
| `false` | `true`   | trailing only      |
| `true`  | `false`  | leading only       |
| `true`  | `true`   | leading + trailing |
| `false` | `false`  | nothing executes   |

Therefore:

> `leading: true` does **not** automatically disable trailing execution.

---

# 13. Default Options

We wanted normal debounce behavior when no options are provided.

Defaults:

```js
leading = false
trailing = true
```

We can normalize options with:

```js
const {
    leading = false,
    trailing = true
} = options || {};
```

So:

```js
debounce(fn, 500);
```

behaves like:

```js
debounce(fn, 500, {
    leading: false,
    trailing: true
});
```

---

# 14. Preserving `this`

Consider:

```js
const obj = {
    name: "Dishank",

    search(query) {
        console.log(this.name, query);
    }
};
```

Direct invocation:

```js
obj.search("javascript");
```

means:

```text
this → obj
query → "javascript"
```

But inside our debounce wrapper, doing:

```js
fn(...args);
```

doesn't preserve the original `this`.

We therefore capture the calling context:

```js
const context = this;
```

and invoke the function with:

```js
fn.call(context, ...args);
```

This means:

```js
fn.call(obj, "javascript");
```

effectively gives the original function:

```text
this → obj
```

---

# 15. Finalizing `this` + Arguments

Our wrapper therefore captures:

```js
const context = this;
```

and:

```js
...args
```

Then invokes:

```js
fn.call(context, ...args);
```

Conceptually:

```text
wrapper invocation
       │
       ├── this ──────→ context
       │
       └── ...args ────→ args
                │
                ▼
              wait
                │
                ▼
       fn.call(context, ...args)
```

---

# 16. `.cancel()`

We wanted to expose:

```js
debounced.cancel();
```

Its purpose:

> Drop any pending invocation and reset the debounce state.

Because JavaScript functions are objects, we can attach methods to the returned function:

```js
const wrapper = function (...args) {
    // ...
};

wrapper.cancel = function () {
    // ...
};

return wrapper;
```

The cancel operation is:

```js
clearTimeout(timer);
timer = undefined;
```

But we also need to clear stored invocation state once we introduce `lastArgs` and `lastThis`.

Conceptually:

```text
cancel()
   ↓
cancel timer
   ↓
forget pending invocation
   ↓
reset debounce state
```

After cancellation, the next call is treated as the beginning of a new burst.

---

# 17. Why `.flush()` is Different

`.cancel()` means:

> "Don't execute the pending invocation."

`.flush()` means:

> "Execute the pending invocation **right now**."

For example:

```text
debounced("cat")
      ↓
   waiting...
      ↓
    flush()
      ↓
fn("cat")  ← immediately
```

---

# 18. Why `.flush()` Needs More State

When the original wrapper is called:

```js
debounced("cat");
```

we need to remember:

```text
latest arguments → ["cat"]
latest this      → obj
```

because `.flush()` may be called later:

```js
debounced.flush();
```

The arguments passed to `.flush()` are irrelevant.

It needs the arguments from the **previous debounced invocation**.

Therefore we introduced:

```js
let lastArgs;
let lastThis;
```

Inside the wrapper:

```js
lastArgs = args;
lastThis = this;
```

---

# 19. `invoke()` Helper

Instead of duplicating invocation logic, we created:

```js
const invoke = () => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;

    pending = false;

    return fn.apply(thisArg, args);
};
```

The purpose of `invoke()` is:

1. Capture the current invocation state.
2. Clear that state.
3. Mark the invocation as no longer pending.
4. Call `fn` with the correct `this` and arguments.

We use:

```js
fn.apply(thisArg, args);
```

because `args` is already an array.

Equivalent idea:

```js
fn.call(thisArg, ...args);
```

---

# 20. Why `pending` is Useful

We introduced:

```js
let pending = false;
```

because:

```text
timer exists
```

doesn't necessarily mean:

```text
a trailing invocation exists
```

For example:

```js
{
    leading: true,
    trailing: false
}
```

After the leading invocation executes, a timer still exists to keep the debounce window alive.

But there is no trailing invocation waiting.

Therefore we distinguish:

```text
timer
  ↓
Is the debounce window active?

pending
  ↓
Is a trailing invocation actually owed?
```

This is more precise than using `timer` for both concepts.

---

# 21. When `pending` Becomes True

If the current call is:

```text
first call + leading enabled
```

we execute immediately:

```js
invoke();
```

That call is already consumed, so:

```text
pending = false
```

For subsequent calls during the same burst:

```js
pending = true;
```

because the latest call should eventually be executed at the trailing edge if trailing execution is enabled.

---

# 22. Timer Management with `startTimer()`

We separated timer creation into:

```js
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
```

The `finally` block ensures that debounce state is reset even if `fn` throws.

The important state transition is:

```text
active debounce window
        ↓
timer expires
        ↓
optional trailing invocation
        ↓
timer = undefined
pending = false
```

---

# 23. `.flush()` with Explicit Pending State

A correct conceptual `.flush()` is:

```text
flush()
  ↓
Is there an active timer?
  │
  ├── NO → nothing to flush
  │
  └── YES
       ↓
   cancel timer
       ↓
   timer = undefined
       ↓
   is trailing invocation pending?
       │
       ├── NO → nothing to invoke
       │
       └── YES → invoke immediately
```

This correctly handles:

### Leading only

```text
leading: true
trailing: false
```

The first call already executed, so `.flush()` should not execute it again.

### Trailing only

```text
leading: false
trailing: true
```

`.flush()` executes the pending invocation immediately.

### Leading + trailing

```text
leading: true
trailing: true
```

If there was only one call, there is no trailing invocation owed.

If there were multiple calls, the latest call is pending and `.flush()` executes it immediately.

---

# 24. Current Implementation

The implementation we ended with is:

```js
function debounce(fn, wait, options) {
  const { leading = false, trailing = true } = options || {};

  let timer;
  let lastArgs;
  let lastThis;
  let pending = false;

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
        if (trailing && pending) {
          invoke();
        }
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
      invoke();
    } else {
      pending = true;
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
    if (timer === undefined) {
      return undefined;
    }

    clearTimeout(timer);
    timer = undefined;

    return trailing && pending
      ? invoke()
      : undefined;
  };

  wrapper.pending = () => pending;

  return wrapper;
}
```

---

# 25. Important Invariants

The most useful way to reason about the implementation is through its invariants.

### `timer`

```text
timer === undefined
    → no active debounce window

timer !== undefined
    → debounce window is active
```

### `pending`

```text
pending === true
    → a trailing invocation is owed

pending === false
    → no trailing invocation is owed
```

### `lastArgs`

Contains the arguments of the **latest debounced call**.

### `lastThis`

Contains the `this` value of the **latest debounced call**.

---

# 26. The Core Mental Model

A debounce instance maintains state:

```text
┌────────────────────────────┐
│       Debounce State       │
│                            │
│ timer                      │
│   → debounce window        │
│                            │
│ lastArgs                   │
│   → latest arguments       │
│                            │
│ lastThis                   │
│   → latest `this`          │
│                            │
│ pending                    │
│   → trailing call owed?    │
└────────────────────────────┘
```

And every call follows roughly:

```text
new call
   ↓
save latest args + this
   ↓
is this the first call?
   │
   ├── YES + leading
   │      ↓
   │   invoke now
   │
   └── otherwise
          ↓
      mark pending
   ↓
cancel old timer
   ↓
start new timer
```

When the timer expires:

```text
timer expires
     ↓
trailing && pending?
     │
     ├── YES → invoke
     │
     └── NO  → nothing
     ↓
reset timer/pending state
```

---

# 27. Main Lessons Learned

The debounce exercise wasn't just about timers. It brought together several important JavaScript concepts:

1. **Higher-order functions**

   * `debounce()` receives a function and returns another function.

2. **Closures**

   * The returned function retains access to `timer`, `lastArgs`, `lastThis`, and `pending`.

3. **Rest parameters**

   * `...args` preserves an arbitrary number of arguments.

4. **`this` binding**

   * `fn.call(thisArg, ...args)` / `fn.apply(thisArg, args)` preserves the original calling context.

5. **Functions as objects**

   * We can attach methods such as:

     ```js
     wrapper.cancel
     wrapper.flush
     wrapper.pending
     ```

6. **Timers**

   * `setTimeout()` schedules execution.
   * `clearTimeout()` cancels scheduled execution.

7. **State machines / invariants**

   * `timer` tracks the debounce window.
   * `pending` tracks whether a trailing invocation is actually owed.

8. **Leading vs trailing edge**

   * `leading` controls execution at the beginning.
   * `trailing` controls execution at the end.
   * They are independent options.

---

# 28. The One-Sentence Definition

> **Debounce delays execution until a specified amount of time has passed without another call, optionally allowing execution at the beginning (`leading`) and/or end (`trailing`) of the burst.**
