---
pageTitle: Reporting JavaScript Errors To New Relic
date: 2019-12-20
---

With New Relic configured properly, unhandled exceptions will be handled and recorded by New Relic automatically. If you want to record a error manually while allowing your code to continue to execute, you can build a quick utility function.

### Utility Function
```js
// src/utils.js

/**
 * Log an instance of an Error to New Relic.
 * @param error Error - The error to log.
 * @returns undefined
 */
const logErrorEvent = (error) => {
  if (
    error instanceof Error &&
    window.newrelic &&
    typeof window.newrelic.noticeError === 'function'
  ) {
    window.newrelic.noticeError(error);
  }
};

export { logErrorEvent };
```

The `if` in this function checks to make sure:
1. Is the argument to `error` an instance of the `Error` class?
2. Is `window.newrelic` defined?
3. Is `window.newrelic.noticeError` defined & is it a `function`?

### Usage
```js
import { logErrorEvent } from './src/utils';

fetch('https://example.com')
  .then(response => response.json())
  .then(json => {
    if (json.error.code) {
      logErrorEvent(new Error(json.error.code))
    }
  })
  .catch(error => logErrorEvent(error);
```
