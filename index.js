var escape = require('xml-escape')
var indefinite = require('indefinite-article')

module.exports = ooxmlSignaturePages

// OOXML Paragraph
function p(content) {
  return ( '<w:p>' + content + '</w:p>' ) }

// OOXML Paragraph Properties
function pPr(content) {
  return ( '<w:pPr>' + content + '</w:pPr>' ) }

// OOXML Run
function run(content) {
  return ( '<w:r>' + content + '</w:r>' ) }

// OOXML Text
function t(text) {
  return ( '<w:t xml:space="preserve">' + escape(text) + '</w:t>' ) }

// A paragraph containing just a page break
var PAGE_BREAK = p(run('<w:br w:type="page"/>'))

// [Signature pages follow.], centered
var PAGES_FOLLOW = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature pages follow.]')))

// [Signature page follows.], centered
var PAGE_FOLLOWS = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature page follows.]')))

var HEADER_INDENT = '720'

// Generate a header paragraph. The part that usually says "The parties are
// entering into...".
function header(text) {
  return p(
    pPr(
      '<w:ind w:firstLine="' + HEADER_INDENT + '" />' +
      '<w:jc w:val="start" />') +
    run(t(text))) }

var BLOCK_INDENT = '4320'

// Generate an indented paragraph.
function indentedParagraph(text) {
  return p(
    pPr('<w:ind w:left="' + BLOCK_INDENT + '" />') +
    run(t(text))) }

// Underscore fill-in-the-blank
var BLANKS = '____________________'

// How to display information fields
var fields = {
  address: [
    'Address',
    ( '\n' + [ BLANKS, BLANKS, BLANKS, BLANKS ].join('\n') ) ],
  date: ['Date', BLANKS ],
  email: [ 'Email', BLANKS ] }

var BY = 'By:\t'

// Generate indented paragraphs for each of the entities in a block.
function entityParagraphs(entities) {
  return entities
    .reduce(
      function(returned, element, index, list) {
        var first = index === 0
        return returned.concat(indentedParagraph(
          ( first ? '' : BY ) +
          ( element.name || BLANKS ) + ', ' +
          indefinite(element.jurisdiction || 'Delaware') + ' ' +
          ( element.jurisdiction || BLANKS ) + ' ' +
          ( element.form || BLANKS ) +
          ( first ? '' : ( ', its ' + ( list[index - 1].by || BLANKS ) ) ))) },
      [ ]) }

var BOLD = '<w:rPr><w:b /></w:rPr>'

// Generate an indented pararaph with the defined term for the signing party in
// bold type.
function termParagraph(term) {
  return p(
    pPr('<w:ind w:left="' + BLOCK_INDENT + '" />') +
    run(BOLD + t(term)) +
    run(t(':'))) }

// Generate a signature page.
function page(argument) {
  return (
    ( 'header' in argument ? header(argument.header + '\n') : '' ) +
    ( 'term' in argument ? termParagraph(argument.term) : '' ) +
    ( 'entities' in argument ?
        entityParagraphs(argument.entities) : '' ) +
    indentedParagraph('\n\n' + BY + BLANKS) +
    indentedParagraph('Name:\t' + ( argument.name || BLANKS )) +
    ( 'entities' in argument ?
         indentedParagraph(
           'Title:\t' +
           ( argument.entities[0].by || BLANKS )) :
         '' ) +
    ( argument.information ?
        argument.information
          .map(function(element) {
            var match = fields[element]
            return indentedParagraph(match[0] + ':\t' + match[1]) })
          .join('') : '' ) ) }

function ooxmlSignaturePages(signaturePages) {
  if (!Array.isArray(signaturePages)) {
    throw new Error('Argument must be an Array of signature pages') }
  return (
    ( signaturePages.length === 1 ? PAGE_FOLLOWS : PAGES_FOLLOW ) +
    PAGE_BREAK +
    signaturePages
      .map(page)
      .join(PAGE_BREAK) ) }
