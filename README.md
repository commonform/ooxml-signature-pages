# ooxml-signature-pages

Given an Array of signature page objects satisfying [signature-page-schema](https://www.npmjs.com/package/signature-page-schema), return a string of [Office Open XML](https://en.wikipedia.org/wiki/Office_Open_XML) (Microsoft Word `.docx`) markup.

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
      date: 'January 1, 2019',
      email: 'jane@someco.com',
      'with copies to': 'legal@someco.com'
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
assert(preFilled.includes('With Copies To'))
```
