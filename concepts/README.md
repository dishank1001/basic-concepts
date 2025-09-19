# Inheritance vs Composition in JavaScript

## 🔑 Analogy: Restaurant

### 🍽️ Inheritance (Prototypes)

Think of a restaurant staff hierarchy:

- **Person** = base role → can walk, talk.
- **Chef** extends Person → inherits walk/talk, adds `cook()`.
- **Manager** extends Person → inherits walk/talk, adds `manage()`.

👉 All staff are people, so they share common behavior.  
This is **prototype inheritance** — a hierarchy where child classes are specializations of the parent.

### 🧩 Composition (Closures)

Now think of dishes on the menu:

- A **Pizza** “has” dough, sauce, cheese.
- A **Burger** “has” bread, patty, sauce.

Each dish is made by combining ingredients (closure functions that hide recipe details).  
👉 Pizza is not a type of bread — it uses bread.  
This is **composition** — objects are built by assembling pieces instead of inheriting.

---

## ⚖️ Core Difference

- **Inheritance (prototype chain):** Staff hierarchy — roles share behavior by being part of the same family tree.
- **Composition (closures):** Menu items — built from reusable building blocks, with recipes (private details) hidden inside the kitchen.

---

## ✅ Thumb Rule

- Use **inheritance** for “is-a” relationships (e.g., Employee is a Person).
- Use **composition** for “has-a / uses” relationships (e.g., Account has balance, Pizza has cheese).

---

## 🏗️ Inheritance (via Prototypes)

**Inheritance = “is-a” relationship.**

```js
class Person {
    constructor(name) { this.name = name; }
    sayHi() { console.log(`Hi, I'm ${this.name}`); }
}

class Employee extends Person {
    constructor(name, role) {
        super(name);
        this.role = role;
    }
    work() { console.log(`${this.name} works as ${this.role}`); }
}

const e = new Employee("Alice", "Engineer");
e.sayHi(); // from Person
e.work();  // from Employee
```

**Characteristics:**

- Behavior is shared via the prototype chain (e.g., `sayHi` lives once in memory).
- Strongly models hierarchies: Employee is a Person.
- Shadowing / overriding possible (super calls).
- **Downside:** Deep hierarchies become brittle (“diamond problem” / hard refactors).

---

## 🔒 Composition (via Closures)

**Composition = “has-a” or “uses” relationship.**

```js
function createAccount(initialBalance = 0) {
    let balance = initialBalance; // private

    return {
        deposit: (amt) => balance += amt,
        withdraw: (amt) => balance -= amt,
        getBalance: () => balance
    };
}

const acc = createAccount(100);
acc.deposit(50);        // 150
console.log(acc.balance); // ❌ undefined (private!)
```

**Characteristics:**

- Uses closures for data hiding (no prototype chain lookup).
- Perfect for encapsulation & privacy.
- Each instance has its own function copies (slightly more memory per object).
- **Downside:** Methods are not shared → every instance re-creates them.

---

## 🔍 Comparing the Two

| Aspect            | Prototype Inheritance           | Closure Composition                      |
|-------------------|--------------------------------|------------------------------------------|
| Relationship      | Models is-a hierarchies        | Models has-a / uses relationships        |
| Encapsulation     | Public by default; no true private vars (ES2022 # fields help) | True privacy via closure                 |
| Memory            | Methods shared on prototype (efficient) | Each instance has its own copies (heavier) |
| Flexibility       | Tight coupling via inheritance  | Flexible mix-and-match (“lego blocks”)   |
| Overriding        | Easy with super or shadowing    | Not natural (replace functions manually) |
| Real-world fit    | Good for hierarchies: Dog extends Animal | Great for utilities, factories, stateful services |

---

## 📌 Thumb Rules

**Use inheritance when:**
- You have a clear hierarchy (Employee is a Person).
- You want shared behavior across many instances (memory efficiency).
- You need method overriding / polymorphism.

**Use composition (closures) when:**
- You want true encapsulation (private state).
- You’re building stateful services or factories.
- You want to mix and match behaviors without forcing hierarchy.
- You’re avoiding brittle class chains (favor composition over inheritance).

---

## 🧠 Real-World Patterns

- **React Hooks:** Closure-based composition (`useState`, `useReducer` are factories with encapsulated state).
- **Express.js Middleware:** Composition (functions that “wrap” behavior).
- **Class hierarchies:** (e.g., DOM elements, Error objects) → prototype inheritance for shared behavior.

---

## ✅ Big Takeaway

- **Inheritance:** Efficient sharing + hierarchies.
- **Closures:** Privacy + flexibility.

Modern JS (React, functional libs) leans more on composition for flexibility & maintainability.