/**
 * Main method is called when the script receives a POST request
 *
 */

// A lock to prevent rows overwriting each other
var lock = LockService.getPublicLock();
lock.waitLock(30000);  // wait 30 seconds before conceding defeat.

var output = ContentService.createTextOutput();
try {
  // Get request params
  var callback = request.parameter.callback;

  // Parse the spreadsheet
  var doc     = SpreadsheetApp.openById(SHEET_ID);
  var sheet   = doc.getSheetByName(SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow();

  var row    = [];
  var rowObj = {};
  // Loop through the header columns
  for (i in headers){
    if (headers[i] == "created_at"){ // special case if you include a 'created_at' column
      newDate = new Date();
      row.push(newDate);
      rowObj[headers[i]] = newDate;
    } else if (headers[i] == "id") { // to create the id column
      row.push(lastRow);
      rowObj[headers[i]] = lastRow;
    } else {                         // else use header name to get data
      row.push(request.parameter[headers[i]]);
      rowObj[headers[i]] = request.parameter[headers[i]];
    }
  }
  sheet.getRange(lastRow+1, 1, 1, row.length).setValues([row]);

  var response = JSON.stringify({result:"success", data: rowObj});

} catch(error){

  var response = JSON.stringify({result:"error", error: error});

} finally {
  lock.releaseLock();

  // Return JSON or JSONP
  if (callback == undefined) {
    output.setContent(response)
        .setMimeType(ContentService.MimeType.JSON);
  } else {
    output.setContent(callback + "(" + response + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
