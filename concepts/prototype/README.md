# JavaScript Prototypes & Inheritance

In JavaScript, **every object has an internal hidden link** (`[[Prototype]]`) pointing to another object—its **prototype**.  
This is the foundation of JavaScript's inheritance, known as **prototype chaining**.

---

## 🔗 How Prototype Chaining Works

```js
const obj = { name: "Bob" };
console.log(obj.toString()); // "toString" isn't defined on obj
```

- When you call `obj.toString()`, JavaScript checks if `toString` exists on `obj`.
- If not found, it follows `obj.[[Prototype]]` to `Object.prototype`.
- It finds `toString` there and executes it.

> **Note:** ES6 `class` syntax is just syntactic sugar over prototypes.

---

## 🧩 Shadowing Properties

**Shadowing** occurs when an object has its own property with the same name as one on its prototype.

- **Read:** Accesses the object's own property first.
- **Delete:** Removes only the object's own property, revealing the inherited one.

```js
const person = { name: "Bob" };
Object.setPrototypeOf(person, { name: "Alice", sayHi() {} });

console.log(person.name); // "Bob" (own property shadows prototype)
delete person.name;
console.log(person.name); // "Alice" (revealed from prototype)
```

---

## 🗺️ Prototype Chain: ASCII Map

```
p
├─ own props: { name: "Bob" }
└─ [[Prototype]] ───────────► Person.prototype
         ├─ sayHi: function () { ... }
         └─ [[Prototype]] ─────► Object.prototype
               ├─ toString: function
               └─ [[Prototype]] ───► null
```

- **Read:** Traverses up the chain until the property is found or `null` is reached.
- **Write:** Usually creates/uses an own property unless intercepted by an accessor or blocked by non-writable props.

---

## ⚡️ Key Points

- **Shadowing:** Own property hides prototype property of the same name.
- **Delete:** Removes only the own property; prototype properties remain intact.
- **Arrow Functions:**  
  - No `.prototype`
  - Not constructible
  - Lexical `this`  
  → Avoid using arrow functions as prototype methods.
- **Best Practices:**  
  - Prefer prototype methods for shared behavior.
  - Use instance arrow functions only for bound callbacks.
  - Avoid modifying built-in prototypes and using `Object.setPrototypeOf` in performance-critical code.

---

## ⚠️ Gotchas with Inheritance

### Shadowing in Inheritance

When a subclass defines a method/property with the same name as its parent, it **shadows** the parent's version.

```js
class Person {
  greet() { console.log("Hello"); }
}
class Employee extends Person {
  greet() { console.log("Hi from Employee"); }
}

const e = new Employee();
e.greet(); // "Hi from Employee" (shadows Person.greet)
```

---

✅ **Summary:**  
Inheritance in JS is just linking prototypes together. That’s why shadowing works the same, why arrow functions don’t belong on prototypes, and why the prototype chain is the backbone of inheritance.