// Classic Closure Example in JavaScript

// The 'outer' function creates a local variable 'count' and returns the 'inner' function.
// The returned 'inner' function forms a closure, retaining access to 'count' even after 'outer' has finished executing.
const outer = () => {
    let count = 0; // Local variable, not accessible outside 'outer'

    // 'inner' is a closure that can access 'count'
    const inner = () => {
        count++; // Modify the outer function's variable
        return count; // Return the updated value
    }

    return inner; // Return the closure
}

// Create an instance of the closure
const fn = outer();

console.log(fn()); // 1
console.log(fn()); // 2
console.log(fn()); // 3

// Each call to 'fn' increments and returns the same 'count' variable,
// demonstrating how closures preserve state between function calls.


// Data Privacy & Encapsulation::Closure-based Account Example using Arrow Functions

// 'createAccount' is an arrow function that initializes a private 'balance' variable.
// It returns an object with methods to interact with 'balance' while keeping it hidden from outside.
const createAccount = (initialBalance = 0) => {
    let balance = initialBalance; // Private variable, not accessible outside

    return {
        // Deposit method: adds amount to balance and returns updated balance
        deposit: (amount) => {
            balance += amount;
            return balance;
        },
        // Withdraw method: subtracts amount if sufficient funds, else throws error
        withdraw: (amount) => {
            if (amount > balance) throw new Error("Insufficient funds");
            balance -= amount;
            return balance;
        },
        // getBalance method: returns current balance
        getBalance: () => balance,
    };
};

// Usage example
const account = createAccount(100);
console.log(account.deposit(50));  // 150
console.log(account.getBalance()); // 150
console.log(account.balance);      // ❌ undefined (hidden!)
