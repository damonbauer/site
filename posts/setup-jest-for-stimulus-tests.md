---
pageTitle: Setup Jest For Stimulus Tests
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
```js
import { Application } from 'stimulus';
import AccountNumbersController from '../../controllers/account_numbers_controller';

const startStimulus = () => {
  const application = Application.start();
  application.register('account-numbers', AccountNumbersController);
};

startStimulus();
```