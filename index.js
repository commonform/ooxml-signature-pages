var escape = require('xml-escape')

module.exports = ooxmlSignaturePages

function pPr(content) {
  return ( '<w:pPr>' + content + '</w:pPr>' ) }

function run(content) {
  return ( '<w:r>' + content + '</w:r>' ) }

function t(text) {
  return ( '<w:t xml:space="preserve">' + escape(text) + '</w:t>' ) }

var PAGE_BREAK = pPr(run('<w:br w:type="page"/>'))

function header(text) {
  return pPr(
    '<w:ind w:firstLine="720" />' +
    '<w:jc w:val="start" />' +
    run(t(text))) }

function paragraph(text) {
  return pPr(
    '<w:ind w:left="1440" />' +
    run(t(text))) }

var BLANKS = '____________________'

var fields = {
  address: 'Address',
  date: 'Date',
  email: 'Email' }

function entityParagraphs(entities) {
  return entities
    .reduce(
      function(returned, element, index, list) {
        var last = index === ( list.length - 1 )
        return paragraph(
          element.name + ', ' +
          element.jurisdiction + ' ' +
          element.form +
          ( last ? '' : ( ', its ' + list[index + 1].role ) )) },
      [ ]) }

function page(argument) {
  return (
    header(argument.header) +
    ( 'term' in argument ?
        paragraph(argument.term) : '' ) +
    ( 'entities' in argument ?
        entityParagraphs(argument.entities) : '' ) +
    paragraph('By: ' + BLANKS) +
    paragraph('Name: ' + argument.name) +
    ( 'entities' in argument ?
         paragraph('Title: ' + argument.entities[0].role) : '' ) +
    ( argument.information ?
        argument.information
          .map(function(element) {
            return paragraph(fields[element] + ': ' + BLANKS) })
          .join('') : '' ) ) }

function ooxmlSignaturePages(signaturePages) {
  if (!Array.isArray(signaturePages)) {
    throw new Error('Argument must be an Array of signature pages') }
  return (
    PAGE_BREAK +
    signaturePages
      .map(page)
      .join(PAGE_BREAK) ) }
