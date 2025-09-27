# JavaScript & TypeScript Foundations — Interview Recap

This file summarizes core JS/TS concepts for interviews. Each section includes theory, definitions, gotchas, and code examples.

---

## 1. JS Engine & Runtime

**Theory:**  
JavaScript runs inside an engine (e.g., V8, SpiderMonkey) that manages code execution, memory, and garbage collection.

**Definitions & Gotchas:**  
- **Execution Context:**  
    The environment in which JS code runs.  
    - **Variable Environment:** Stores `var` and function declarations.
    - **Lexical Environment:** Scope chain for resolving identifiers.
    - **`this` Binding:** Depends on how a function is called.
    ```js
    function foo() { console.log(this); }
    foo(); // 'this' is global (window in browser)
    ```
- **Call Stack:**  
    LIFO stack of execution contexts.  
    ```js
    function a() { b(); }
    function b() { c(); }
    function c() { }
    a(); // Stack: a -> b -> c
    ```
- **Memory Model:**  
    - **Stack:** Primitives, references.
    - **Heap:** Objects, closures.
- **Garbage Collection:**  
    JS uses mark & sweep; only unreachable objects are collected.

**Gotcha:**  
Global variables pollute the global scope; prefer block scope.

---

## 2. Event Loop & Concurrency

**Theory:**  
JS is single-threaded but handles async tasks via the event loop.

**Definitions & Gotchas:**  
- **Order in Node.js:**  
    1. Sync code  
    2. `process.nextTick` (highest priority)  
    3. Promises/microtasks  
    4. Timers (`setTimeout`, `setInterval`)  
    5. I/O callbacks  
    6. `setImmediate`
- **Trick:**  
    - `nextTick` = “cut in line”
    - Promises = “after stack, before timers”
    ```js
    setTimeout(() => console.log('timeout'), 0);
    Promise.resolve().then(() => console.log('promise'));
    process.nextTick(() => console.log('nextTick'));
    // Output: nextTick, promise, timeout
    ```

**Gotcha:**  
Timers are not precise for scheduling; use Promises for microtasks.

---

## 3. Closures, Scope, Hoisting

**Theory:**  
Closures allow functions to access variables from their outer scope even after the outer function has returned.

**Definitions & Gotchas:**  
- **Scope:**  
    - Global, function, block (`let/const`)
- **Hoisting:**  
    - `var` → hoisted as `undefined`
    - `let/const` → hoisted but uninitialized (TDZ)
    - Functions → fully hoisted
    ```js
    console.log(a); // undefined
    var a = 5;
    ```
    ```js
    console.log(b); // ReferenceError
    let b = 10;
    ```
- **Closures:**  
    Function + its lexical environment.
    ```js
    function outer() {
        let x = 10;
        return function inner() { return x; }
    }
    const fn = outer();
    console.log(fn()); // 10
    ```
- **TDZ (Temporal Dead Zone):**  
    Accessing `let/const` before initialization throws `ReferenceError`.

**Gotcha:**  
Closures can cause memory leaks if not managed.

---

## 4. Objects, Prototypes & Classes

**Theory:**  
JS uses prototypes for inheritance; classes are syntactic sugar over prototypes.

**Definitions & Gotchas:**  
- **Prototype Chain Lookup:**  
    object → constructor.prototype → Object.prototype
- **Instance Props:**  
    Defined in constructor; each instance gets its own copy.
- **Prototype Methods:**  
    Defined on prototype/class body; shared across instances.
    ```js
    function Person(name) { this.name = name; }
    Person.prototype.sayHi = function() { return `Hi, ${this.name}`; }
    const p = new Person('Sam');
    p.sayHi(); // "Hi, Sam"
    ```
- **Classes:**  
    Syntactic sugar for prototypes.
    ```js
    class Animal {
        speak() { return 'Roar'; }
    }
    ```
- **Rule:**  
    Constructor methods = duplicated; class body methods = shared.

**Gotcha:**  
Arrow functions do not have their own `this`.

---

## 5. Async Patterns

**Theory:**  
Async code improves responsiveness; patterns evolved from callbacks to Promises and async/await.

**Definitions & Gotchas:**  
- **Callbacks → Promises → async/await:**  
    ```js
    // Callback
    fs.readFile('file.txt', (err, data) => {});

    // Promise
    fetch('/api').then(res => res.json());

    // async/await
    async function getData() {
        const res = await fetch('/api');
        return res.json();
    }
    ```
- **Concurrency limits:**  
    Use pools/limiters (e.g., `pLimit`) to control parallelism.
- **Cancellation:**  
    Use `AbortController` or cooperative checks.
    ```js
    const controller = new AbortController();
    fetch(url, { signal: controller.signal });
    controller.abort();
    ```
- **Timeouts:**  
    Wrap with `Promise.race`.
    ```js
    Promise.race([
        fetch('/api'),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 1000))
    ]);
    ```

**Gotcha:**  
Uncaught async errors can crash Node.js processes.

---

## 6. TypeScript Deep Dive

**Theory:**  
TypeScript adds static typing to JS, improving safety and tooling.

**Definitions & Gotchas:**  
- **Interface vs Type:**  
    - Interface: extendable, mergeable, implements (best for object/class shapes)
    - Type: unions, intersections, primitives, tuples
    ```ts
    interface User { name: string }
    type Point = { x: number, y: number }
    ```
- **Utility Types:**  
    - `Partial<T>`: all optional
    - `Required<T>`: all required
    - `Readonly<T>`: immutability
    - `Pick<T,K>` / `Omit<T,K>`: select/remove fields
    - `Record<K,T>`: key/value maps
    - `ReturnType<F>` / `Parameters<F>`
    ```ts
    type User = { name: string, age: number }
    type UserPartial = Partial<User> // { name?: string, age?: number }
    ```
- **Enums vs Literal Unions:**  
    - Union (`"a" | "b"`): compile-time only, preferred
    - Enum: runtime object, heavier
    ```ts
    type Status = "open" | "closed";
    enum StatusEnum { Open, Closed }
    ```

**Gotcha:**  
Prefer unions over enums for type safety and bundle size.

---

## 7. Error Handling

**Theory:**  
Error handling is crucial for robust apps; JS distinguishes sync and async errors.

**Definitions & Gotchas:**  
- **Sync errors:**  
    Thrown, unwind stack, caught by try/catch.
    ```js
    try { throw new Error('fail'); } catch (e) { }
    ```
- **Async errors:**  
    Rejected promises, handled with `.catch` or try/catch in async functions.
    ```js
    Promise.reject('fail').catch(e => {});
    ```
- **Timers/Callbacks:**  
    Outer try/catch won’t catch async errors.
- **Prod patterns:**  
    - Separate `AbortError` from real failures.
    - Metrics: `requests_cancelled_total`
    - Logs: structured `{ event: "cancelled", reason }`

**Gotcha:**  
Always handle promise rejections to avoid unhandled rejection warnings.

---

## Interview Mnemonics

- **Execution context:** “Vars, Lexical, This.”
- **Event loop order:** “Sync → nextTick → Promises → Timers → I/O → Immediate.”
- **Interfaces vs Types:** “Interfaces extend, Types compose.”
- **Closure:** “Function + Environment = Closure.”

---

✅ This file is designed for quick look-back before interviews.

