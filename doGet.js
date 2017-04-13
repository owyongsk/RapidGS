/**
 * Main method is called when the script receives a GET request.
 * Receives the request, generates and returns the output.
 */

var output = ContentService.createTextOutput();
try {
  // Get request params.
  var callback  = request.parameters.callback;
  var headerRow = request.parameters.header   || 1;
  var startRow  = request.parameters.startRow || 2;

  // Parse the spreadsheet.
  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet       = spreadsheet.getSheetByName(SHEET_NAME);
  var keys        = getHeaderRowKeys_(sheet, headerRow);
  var data        = readData_(sheet, keys, startRow);

  // Filter for matching terms.
  data = data.filter(function(entry) {
    var matches = true;
    for (var k in keys) {
      var key = keys[k].replace(/\s+/g, '_');
      var searchTerm = request.parameters[key];
      // Use the string form of the value since params are strings by default
      if (searchTerm != undefined)
        matches = matches && ("" + entry[key] == searchTerm);
    }
    // Matches is true if all params are undefined or all values for keys match.
    return matches;
  });

  var response = JSON.stringify({result: "success", data: data});

} catch(error){

  var response = JSON.stringify({result:"error", error: error});

} finally {
  // Return JSON or JSONP
  if (callback == undefined) {
    output.setContent(response).setMimeType(ContentService.MimeType.JSON);
  } else {
    output.setContent(callback + "(" + response + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/**
 * Get a row in a spreadsheet as an Object, using the values in the header row as
 * keys and the corresponding row values as the values.
 *
 * @param sheet       Sheet object with the data to get
 * @param properties  Array of keys to use for the row values.
 * @param startRowNum Top row number of the rows to parse.
 */
function readData_(sheet, properties, startRowNum) {
  var rows = getDataRows_(sheet, startRowNum);
  var data = [];
  for (var r = 0, l = rows.length; r < l; r++) {
    var row = rows[r];
    var record = {};
    for (var p in properties) {
      record[properties[p]] = row[p];
    }
    data.push(record);
  }
  return data;
}

/**
 * Parse spreadsheet data as an array of Javascript Objects.
 *
 * @param sheet       Sheet object with the data to get
 * @param startRowNum Top row number of the rows to parse.
 */
function getDataRows_(sheet, startRowNum) {
  return sheet.getRange(startRowNum, 1, sheet.getLastRow()-1, sheet.getLastColumn())
              .getValues();
}

/**
 * Return the array of keys used in the header, replacing whitespace with underscores.
 *
 * @param sheet       Sheet object with the data to get
 * @param rowNum      Exact row number of the header.
 */
function getHeaderRowKeys_(sheet, rowNum) {
  return getHeaderRow_(sheet, rowNum).map(function(value) {
    return value.replace(/\s+/g, '_');
  });
}

/**
 * Get the values in the header row of the given sheet in a spreadsheet
 *
 * @param sheet       Sheet object with the data to get
 * @param rowNum      Exact row number of the header.
 */
function getHeaderRow_(sheet, rowNum) {
  return sheet.getRange(rowNum, 1, 1, sheet.getLastColumn()).getValues()[0];
}
