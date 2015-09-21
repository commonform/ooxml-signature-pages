var escape = require('xml-escape')

module.exports = ooxmlSignaturePages

var PAGE_BREAK = (
  [ '<w:pPr>',
      '<w:r>',
        '<w:br w:type="page"/>',
      '</w:r>',
    '</w:pPr>' ]
    .join('') )

function header(text) {
  return (
    [ '<w:pPr>',
        '<w:ind w:firstLine="720" />',
        '<w:jc w:val="start" />',
        '<w:r>',
          '<w:t xml:space="preserve">', escape(text), '</w:t>',
        '</w:r>',
      '</w:pPr>' ]
    .join('') ) }

function page(argument) {
  return (
    header(argument.header) ) }

function ooxmlSignaturePages(signaturePages) {
  if (!Array.isArray(signaturePages)) {
    throw new Error('Argument must be an Array of signature pages') }
  return (
    PAGE_BREAK +
    signaturePages
      .map(page)
      .join(PAGE_BREAK) ) }
