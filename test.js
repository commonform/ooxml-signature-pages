var assert = require('assert')
var ooxml = require('.')
var schema = require('signature-page-schema')
var tv4 = require('tv4')

var example = {
  header: 'The parties enter into this agreement on the date first written above.',
  term: 'Assignor',
  name: 'Joe Schmo' }

assert(
  tv4.validateMultiple(example, schema),
  'example is valid signature page')

assert.equal(
  ooxml([ example ]),
  [ '<w:pPr>',
      '<w:r>',
        '<w:br w:type="page"/>',
      '</w:r>',
    '</w:pPr>',
    '<w:pPr>',
      '<w:ind w:firstLine="720" />',
      '<w:jc w:val="start" />',
      '<w:r>',
        '<w:t xml:space="preserve">The parties enter into this agreement on the date first written above.</w:t>',
      '</w:r>',
    '</w:pPr>',
    '<w:pPr>',
      '<w:ind w:left="1440" />',
      '<w:r>',
        '<w:t xml:space="preserve">Assignor</w:t>',
      '</w:r>',
    '</w:pPr>' ]
    .join(''))
