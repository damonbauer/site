---
pageTitle: Testing Stimulus With Jest
date: 2019-11-03
---

I've been introducing [Stimulus](https://stimulusjs.org/) to a Rails app that uses [Jest](https://jestjs.io/) for testing JavaScript. After some research, I've found a pretty decent setup that allows me to load up a Stimulus controller to writes tests. If you need to do the same, here are some things you'll need, as well as some nice-to-haves.

### MutationObserver
Stimulus relies on `MutationObserver`, but Jest (which uses jsdom under the hood) doesn't support it, so you'll need to fake it. Thankfully, there's a [mutationobserver-shim](https://www.npmjs.com/package/`mutationobserver-shim`) that handles it for you. Install it by running `yarn i mutationobserver-shim --dev`.

You'll also need a Jest setup script. I like to make a `setup-jest.js` file in the root of my project. Inside, import the shim:

```js
// ./setup-jest.js
import 'mutationobserver-shim';
```

Make sure you configure Jest to look for this file. I like to make a `jest-config.js` file in the root of my project; this file holds all the configuration I need for Jest. Set the `setupFilesAfterEnv` option to look for the setup file:

```js
// ./jest-config.js
// other config...
setupFilesAfterEnv: [
  '<rootDir>/setup-jest.js'
]
```

### Writing A Test
Now, it's just a matter of including your Stimulus controller in your test. To do so, you'll need to import and "start" Stimulus, and register your controller that you want to test:
```js
import { Application } from 'stimulus';
import HelloWorldController from '../../controllers/hello_world_controller';

const startStimulus = () => {
  const application = Application.start();
  application.register('hello-world', HelloWorldController);
};

describe('the file under test', () => {
  beforeEach(() => {
    startStimulus();
    document.body.innerHtml = `
      <form data-controller="hello-world">
        <input type="text" data-testid="Foo">
        <button name="button" type="submit" disabled="disabled">Verify</button>
      </form>
    `
  });

  describe('a scenario', () => {
    it('tests the scenario', () => {
      // ...
    });
  });
});
```

### Nice To Haves
#### dom-testing-library
I like to use [dom-testing-library](https://testing-library.com/docs/dom-testing-library/intro) to make accessing & manipulating the DOM easier in tests. When writing tests for Stimulus controllers, I've found that `getByTestId` and `waitForDomChange` are 2 especially helpful methods.

#### mountDOM / cleanupDOM
I wrote a few quick helper methods that make it easy to add & remove markup from the DOM. These live in a `utils.js` file in `app/javascript/__tests__/utils.js`.

```js
// app/javascript/__tests__/utils.js

/**
 * Inserts a string of HTML into the DOM.
 * @param {string} htmlString - The HTML to insert.
 * @returns {HTMLElement} The newly inserted DOM element.
 */
const mountDOM = (htmlString = '') => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  document.body.appendChild(div);

  return div;
};

const cleanupDOM = () => {
  document.body.innerHTML = '';
};

export {
  cleanupDOM,
  mountDOM
};
```

Typically, a test I write will use these methods like so:

```js
let container = null;

describe('the file under test', () => {
  afterEach(() => {
    cleanupDOM();
  });

  describe('a scenario', () => {
    it('tests the scenario', () => {
      container = mountDOM(`
        <form data-controller="hello-world">
          <input type="text" data-testid="Foo">
          <button name="button" type="submit" disabled="disabled">Verify</button>
        </form>
      `);

      // Continue with the test...
    });
  });
```