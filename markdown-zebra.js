/**
 * markdown-zebra v0.1
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
      'headerDividerFill': '-',
      'rowDelimiter': '\n',
      'newlineOutput': '<br>',
   };

   // Create data type for table data
   var TableStruct = function(rows, header) {
      this.rows = rows;
      this.header = header;
   };

   zebra.parseMarkdownTable = function(tableStr) {
      var rows = tableStr.split(zebra.config.rowDelimiter);
      var tableRows = _.map(rows, function(row) {
         var parsedRow = _.map(row.split(zebra.config.columnDelimiter), function(str) { return str.trim(); });
         return parsedRow.slice(1, parsedRow.length-1);
      });

      var tableHeader = zebra.findHeaderInRows(tableRows);
      if (tableHeader) {
         tableRows.shift();  // remove the header row
         tableRows.shift();  // remove the header divider
      }

      var tableData = new TableStruct(tableRows, tableHeader);

      return tableData;
   };

   zebra.findHeaderInRows = function(tableRows) {
      var notEnoughRows = tableRows.length < 3;
      if (notEnoughRows) {
         return null;
      }

      // Make sure we have a header divider. Check that all the cols
      // have the divider filling at least half of the field.
      var hasHeaderDivider = _.reduce(tableRows[1], function(result, item) {
         return result && item.split(zebra.config.headerDividerFill).length > item.length/2;
      }, true);

      if (hasHeaderDivider) {
         return tableRows[0];
      }

      return null;
   };

   zebra.createMarkdownTable = function(tableRows, tableHeader, preferredColWidths) {
      if (preferredColWidths == null) {
         var allRows = tableRows.slice(0);
         if (tableHeader) {
            allRows.unshift(tableHeader);
         }
         preferredColWidths = zebra.findMaxRowWidths(allRows);
      }

      if (!(preferredColWidths instanceof Array)) {
         preferredColWidths = Array(_.first(tableRows).length).fill(preferredColWidths);
      }

      var tableStr = '';

      if (tableHeader) {
         tableStr += zebra.formatRow(tableHeader, preferredColWidths.slice(0));
         tableStr += zebra.generateHeaderDivider(preferredColWidths.slice(0));
      }

      tableStr += _.reduce(tableRows, function(output, row) {
         var rowWidths = preferredColWidths.slice(0);
         return output + zebra.formatRow(row, rowWidths);
      }, '');

      return tableStr.replace(/^\s+|\s+$/g, '');
   };

   zebra.formatRow = function(items, widths) {
      return _.reduce(items, function(output, value) {
            var width = widths.shift() + 1;
            return output + zebra.formatColumn(value, width);
         }, '') +
         zebra.config.columnDelimiter +
         zebra.config.rowDelimiter;
   };

   zebra.generateHeaderDivider = function(widths) {
      var cols = _.map(widths, function(width) {
         return zebra.createColumnFill(zebra.config.headerDividerFill, width);
      }, '');

      return zebra.formatRow(cols, widths);
   };

   zebra.formatColumn = function(value, width) {
      return zebra.config.columnDelimiter +
         zebra.config.columnPadding +
         value +
         zebra.createColumnFill(zebra.config.columnFill, Math.max(width - value.toString().length, 0)) ;
   };

   zebra.createColumnFill = function(fill, width) {
      return Array(width+1).join(fill);
   };

   zebra.replaceNewlinesForOutput = function(str) {
      return str.replace('\n', zebra.config.newlineOutput);
   };

   zebra.tidyUpTable = function(tableStr, preferredColWidths) {
      var data = zebra.parseMarkdownTable(tableStr);
      var table = zebra.createMarkdownTable(data.rows, data.header, preferredColWidths);
      return zebra.replaceNewlinesForOutput(table);
   };

   zebra.findMaxRowWidths = function(rows) {
      return _.reduce(rows, function (widths, row) {
         return _.map(_.keys(widths), function (key) {
            return Math.max(widths[key], String(row[key]).length);
         });
      }, _.range(rows[0].length).map( function () { return 1; }));
   };
}.call(this));
