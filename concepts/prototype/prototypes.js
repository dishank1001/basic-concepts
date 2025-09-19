// --- Constructor Function Example ---

// Define a constructor function
function Person(name) { 
    this.name = name; // Instance property
}

// Add a method to the prototype
Person.prototype.sayHi = function() { 
    console.log(`Hi, I'm ${this.name}`); 
};

const p = new Person("Bob");

// --- Shadowing Prototype Methods ---

// Add an own property (method) with the same name, shadowing the prototype
p.sayHi = () => console.log("Custom hi");
p.sayHi();            // "Custom hi"  (own property takes precedence)

// Remove the own property, prototype method is used again
delete p.sayHi;       
p.sayHi();            // "Hi, I'm Bob" (falls back to prototype)

// --- ES6 Class Syntax (Syntactic Sugar over Prototypes) ---

class Car {
    drive() {
        console.log("vroom");
    }
}

const c = new Car();
c.drive(); // works via Car.prototype

// --- Advanced Prototype Example: Inheritance ---

// Animal constructor
function Animal(name) {
    this.name = name;
}

// Add method to Animal's prototype
Animal.prototype.speak = function() {
    console.log(`${this.name} makes a noise.`);
};

// Dog constructor, inheriting from Animal
function Dog(name) {
    Animal.call(this, name); // Call parent constructor
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Override speak method
Dog.prototype.speak = function() {
    console.log(`${this.name} barks.`);
};

const d = new Dog("Rex");
d.speak(); // "Rex barks."
delete d.speak;
d.speak(); // "Rex makes a noise." (falls back to Animal.prototype)

// --- Checking Prototype Chain ---

console.log(d instanceof Dog);    // true
console.log(d instanceof Animal); // true
console.log(Dog.prototype.isPrototypeOf(d));    // true
console.log(Animal.prototype.isPrototypeOf(d)); // true
