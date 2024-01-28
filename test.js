// console.log("globalThis", globalThis);

function test() {
  this.a = "test fn";
  console.log(this.a);
}

// test();

// new (function test() {
//   this.a = "test iife";
//   console.log(this.a);
// })();

class Test {
  constructor() {
    this.a = "test class";
    console.log(this.a);
  }
}

// new Test();

const f = function () {
  console.log(this);
};

const object1 = {
  method: f,
};

const object2 = {
  method: f,
};

const object3 = {
  method: f.bind(this),
};

// console.log(object1.method(), object2.method(), object3.method());

// console.log(f(object1));

class Parent {
  constructor() {}
  method() {
    console.log("method");
  }

  arrowFnProperty = () => {
    console.log("arrow fn");
  };
}

class Child extends Parent {
  constructor() {
    super();
  }

  method() {
    super.method();
    console.log("child method");
  }

  arrowFnProperty() {
    super.arrowFnProperty();
    console.log("child arrow fn");
  }
}

// const obj = new Child();

// obj.method();
// obj.arrowFnProperty();

console.log(new Parent());
