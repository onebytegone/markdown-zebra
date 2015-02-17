/**
 * markdown-zebra v0.01
 *
 * Copyright 2015 Ethan Smith
 * Licensed under the MIT license.
 *
 * Dependencies:
 *  underscore.js - (http://underscorejs.org)
 */

;(function() {
   // Store the base object
   var root = this;

   // Create referance to `zebra` object
   var zebra = function() { };
   root.zebra = zebra;

   // Default config
   zebra.config = {
      'columnDelimiter': '|',
      'columnFill': '&nbsp;',
      'columnPadding': '&nbsp;',
      'rowDelimiter': '\n',
      'newlineOutput': '<br>',
   };

   zebra.parseMarkdownTable = function(tableStr) {
      var rows = tableStr.split(zebra.config.rowDelimiter);
      var tableData = _.map(rows, function(row) {
         var parsedRow = _.map(row.split(zebra.config.columnDelimiter), function(str) { return str.trim(); });
         return parsedRow.slice(1, parsedRow.length-1);
      });
      return tableData;
   };

   zebra.createMarkdownTable = function(tableData, preferredColWidths) {
      if (preferredColWidths == null) {
         // TODO: this would be nice to have auto calculate based on width of the contents.
         preferredColWidths = 20;
      }

      if (!(preferredColWidths instanceof Array)) {
         preferredColWidths = Array(_.first(tableData).length).fill(preferredColWidths);
      }

      var tableStr = _.reduce(tableData, function(output, row) {
         var rowWidths = preferredColWidths.slice(0);
         return output +
            _.reduce(row, function(output, value) {
               var width = rowWidths.shift() + 1;
               return output +
                  zebra.config.columnDelimiter +
                  zebra.config.columnPadding +
                  value +
                  Array(Math.max(width - value.toString().length, 0)).join(zebra.config.columnFill) +
                  zebra.config.columnPadding;
            }, '') +
            zebra.config.columnDelimiter +
            zebra.config.rowDelimiter;
      }, '');

      return tableStr;
   };

   zebra.replaceNewlinesForOutput = function(str) {
      return str.replace('\n', zebra.config.newlineOutput);
   }

   zebra.tidyUpTable = function(tableStr, preferredColWidths) {
      var data = zebra.parseMarkdownTable(tableStr);
      var table = zebra.createMarkdownTable(data, preferredColWidths);
      return zebra.replaceNewlinesForOutput(table);
   };
}.call(this));
