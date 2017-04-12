// shortly after my original solution Google announced the LockService[1]
// this prevents concurrent access overwritting data
// [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
// we want a public lock, one that locks for all invocations
var lock = LockService.getPublicLock();
lock.waitLock(30000);  // wait 30 seconds before conceding defeat.

var output = ContentService.createTextOutput();
try {
  // next set where we write the data - you could write to multiple/alternate destinations
  var doc = SpreadsheetApp.openById(SHEET_ID);
  var sheet = doc.getSheetByName(SHEET_NAME);

  // we'll assume header is in row 1 but you can override with header_row in GET/POST data
  var headRow = request.parameter.header_row || 1;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow(); // get next row
  var row = [];
  // loop through the header columns
  for (i in headers){
    if (headers[i] == "created_at"){ // special case if you include a 'created_at' column
      row.push(new Date());
    } else if (headers[i] == "id") { // to create the id column
      row.push(lastRow);
    } else { // else use header name to get data
      row.push(request.parameter[headers[i]]);
    }
  }
  // more efficient to set values as [][] array than individually
  sheet.getRange(lastRow+1, 1, 1, row.length).setValues([row]);
  // return json success results
  output.setContent('(' + JSON.stringify({"result":"success", "id": lastRow}) + ')')
        .setMimeType(ContentService.MimeType.JSON);
} catch(error){
  // if error return this
  output.setContent('(' + JSON.stringify({"result":"error", "error": error}) + ')')
        .setMimeType(ContentService.MimeType.JSON);
} finally { //release lock
  lock.releaseLock();
}
