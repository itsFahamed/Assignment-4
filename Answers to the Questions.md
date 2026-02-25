1. What is the difference between getElementById, getElementsByClassName, and querySelector / querySelectorAll?
ans: getElementById returns one element by ID; getElementsByClassName returns a live collection by class; querySelector / All use CSS selectors and return first match / static list.

2. How do you create and insert a new element into the DOM?
ans: Create using document.createElement() and insert via append(), appendChild(), or similar DOM methods.

3. What is Event Bubbling? And how does it work?
ans: Event bubbling is when an event starts at the target element and propagates upward through parent elements.

4. What is Event Delegation in JavaScript? Why is it useful?
ans: Event delegation uses a single parent listener to manage child events, improving performance and handling dynamic elements.

5. What is the difference between preventDefault() and stopPropagation() methods?
ans: preventDefault() stops default browser behavior, while stopPropagation() stops event propagation.