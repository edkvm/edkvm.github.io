function gotot(index) {
  linkXpath = "//table[@class='results-table']/tbody/tr[@class='row']";
  
  var info = document.evaluate(linkXpath, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)

  infoItems = document.evaluate("td/a[@class='investment-count']", info.snapshotItem(i), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  window.open(infoItems.snapshotItem(0).attributes['href'].value, "ttt");
  window.focus();
}

function listItems() {
  linkXpath = "//table[@class='results-table']/tbody/tr[@class='row']";
  
  var info = document.evaluate(linkXpath, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  range = Array.apply(null, Array(info.snapshotLength)).map(function (_, i) {return i;});
  list = [];
  range.forEach(function(i) { 
    var infoItems = document.evaluate("td[@class='investor-item']/div/h4/a", info.snapshotItem(i), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
    link = infoItems.snapshotItem(0).attributes['href'].value;
    ary = link.split('/');
    slug = ary[ary.length-1];
    list[i] = { 
      name: infoItems.snapshotItem(0).textContent.trim(),
      slug: slug,
      link: "https://www.crunchbase.com" + infoItems.snapshotItem(0).attributes['href'].value
    }
  });

  console.clear();
  console.log(JSON.stringify(list))
}
