# ooxml-signature-pages

Given an Array of signature page objects satisfying [signature-page-schema](https://www.npmjs.com/package/signature-page-schema), return a string of OOXML markup.

```javascript
var assert = require('assert')
var signaturePages = require('ooxml-signature-pages')
```

## Blank Pages

```javascript
var blankPages = signaturePages([
  {
    header: (
      'The parties are signing this agreement ' +
      'on the dates by their signatures.'
    ),
    entities: [
      {
        name: 'SomeCo, Inc.',
        form: 'corporation',
        jurisdiction: 'Delaware',
        by: 'Chief Executive Officer'
      }
    ],
    information: ['date']
  },
  {
    samePage: true,
    information: ['date']
  }
])
assert(typeof blankPages === 'string')
```

## Pre-Filled Pages

```javascript
var preFilled = signaturePages([
  {
    entities: [
      {
        name: 'SomeCo, Inc.',
        form: 'corporation',
        jurisdiction: 'Delaware',
        by: 'Chief Executive Officer'
      }
    ],
    name: 'Jane Manager',
    information: {
      date: 'January 1, 2019'
    }
  },
  {
    samePage: true,
    name: 'John Doe',
    information: {
      date: 'January 2, 2019'
    }
  }
])
assert(typeof preFilled === 'string')
```
