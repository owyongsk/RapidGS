# Install

1. Copy and paste script below to your Google Spreadsheet under `Tools`,
`Script Editor`

```
var SHEET_ID   = "";       // You can see this from your spreadsheet URL, eg: RgR8MnlYJsDIuY-7qbS7mICOLoteb
var SHEET_NAME = "Sheet1"; // Change this to your sheet name

function doGet(request){
  var cache   = CacheService.getDocumentCache();
  var doGetJs = cache.get("doGet");
  if (doGetJs == null) {
    doGetJs = UrlFetchApp.fetch('https://rawgit.com/owyongsk/RapidGS/master/doGet.js').getContentText();
    cache.put("doGet", doGetJs, 21600);
  }
  eval(doGetJs);
  return output;
}

function doPost(request){
  var cache    = CacheService.getDocumentCache();
  var doPostJs = cache.get("doPost");
  if (doPostJs == null) {
    doPostJs = UrlFetchApp.fetch('https://rawgit.com/owyongsk/RapidGS/master/doPost.js').getContentText();
    cache.put("doPost", doPostJs, 21600);
  }
  eval(doPostJs);
  return output;
}
```

# Credits

Credits to [ronaldsmartin](https://gist.github.com/ronaldsmartin/47f5239ab1834c47088e)
and [mhawksey](https://gist.github.com/mhawksey/1276293) for their previous
work on integrating with Google Spreadsheet
