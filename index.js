var escape = require('xml-escape')
var indefinite = require('indefinite-article')

module.exports = ooxmlSignaturePages

function p(content) {
  return ( '<w:p>' + content + '</w:p>' ) }

function pPr(content) {
  return ( '<w:pPr>' + content + '</w:pPr>' ) }

function run(content) {
  return ( '<w:r>' + content + '</w:r>' ) }

function t(text) {
  return ( '<w:t xml:space="preserve">' + escape(text) + '</w:t>' ) }

var PAGE_BREAK = p(run('<w:br w:type="page"/>'))

var PAGES_FOLLOW = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature pages follow.]')))

function header(text) {
  return p(
    pPr(
      '<w:ind w:firstLine="720" />' +
      '<w:jc w:val="start" />') +
    run(t(text))) }

function paragraph(text) {
  return p(
    pPr('<w:ind w:left="4320" />') +
    run(t(text))) }

var BLANKS = '____________________'

var fields = {
  address: [
    'Address',
    ( '\n' + [ BLANKS, BLANKS, BLANKS, BLANKS ].join('\n') ) ],
  date: ['Date', BLANKS ],
  email: [ 'Email', BLANKS ] }

function entityParagraphs(entities) {
  return entities
    .reverse()
    .reduce(
      function(returned, element, index, list) {
        var first = index === 0
        return returned.concat(paragraph(
          element.name + ', ' +
          indefinite(element.jurisdiction) + ' ' +
          element.jurisdiction + ' ' +
          element.form +
          ( first ? '' : ( ', its ' + list[index - 1].role ) ))) },
      [ ]) }

function termParagraph(term) {
  return p(
    pPr('<w:ind w:left="4320" />') +
    run(
      '<w:rPr>' +
        '<w:b />' +
      '</w:rPr>' +
      t(term)) +
    run(t(':'))) }

function page(argument) {
  return (
    header(argument.header + '\n') +
    ( 'term' in argument ?
        termParagraph(argument.term) : '' ) +
    ( 'entities' in argument ?
        entityParagraphs(argument.entities) : '' ) +
    paragraph('\n\nBy:\t' + BLANKS) +
    paragraph('Name: ' + argument.name) +
    ( 'entities' in argument ?
         paragraph('Title:\t' + argument.entities[0].role) : '' ) +
    ( argument.information ?
        argument.information
          .map(function(element) {
            var match = fields[element]
            return paragraph(match[0] + ':\t' + match[1]) })
          .join('') : '' ) ) }

function ooxmlSignaturePages(signaturePages) {
  if (!Array.isArray(signaturePages)) {
    throw new Error('Argument must be an Array of signature pages') }
  return (
    PAGES_FOLLOW +
    PAGE_BREAK +
    signaturePages
      .map(page)
      .join(PAGE_BREAK) ) }
