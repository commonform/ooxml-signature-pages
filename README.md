# ooxml-signature-pages

Given an Array of signature page objects satisfying [signature-page-schema](https://www.npmjs.com/package/signature-page-schema), return a string of [Office Open XML](https://en.wikipedia.org/wiki/Office_Open_XML) (Microsoft Word `.docx`) markup.

```javascript
import signaturePages from 'ooxml-signature-pages'
import assert from 'node:assert'
```

## Blank Pages

```javascript
const blankPages = signaturePages([
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
const preFilled = signaturePages([
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
