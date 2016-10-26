var Extractor = (function() {
    const xpathInvestor = "//h1[@id='profile_header_heading']/a";
    const xpathInvestments = "//table[@class='section-list table investors']/tbody/tr";
    const monthMapping = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, 
                           "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
    
    const money_multi = { 'M': 1000000, 'K': 100000, 'B': 1000000000 }

    const base_url = "https://www.crunchbase.com"
    
    function Extractor() {
      this.investor = extractInvestor();  
    }
    
    function extractInvestor() {
      var raw = 
        document.evaluate(xpathInvestor, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      if (raw.snapshotLength <= 0) {
        return {};
      }   
      
      return extractDetailsFromLink(raw);
    }  

    function extractDetailsFromLink(raw) {
      name = raw.snapshotItem(0).textContent;
    
      link = raw.snapshotItem(0).attributes["href"].value
      
      ary = link.split('/')

      slug = ary[ary.length-1];

      return { 
        name: name,
        slug: slug,
        link: base_url + link 
      };      
    }

    Extractor.prototype.getInvestor = function extractInvestor() {
      return extractInvestor();   
    }
              
    Extractor.prototype.getInvestments = function extract(investor) {
      var nodesRow = 
        document.evaluate(xpathInvestments, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      var list = []
      
      for (var i = 0; i < nodesRow.snapshotLength; i++) {
        rawInvestment = document.evaluate('td', nodesRow.snapshotItem(i), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
        
        rawLinkWrapper = document.evaluate("a", rawInvestment.snapshotItem(1), null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        

        company = extractDetailsFromLink(rawLinkWrapper);
        
        rawDate = rawInvestment.snapshotItem(0).textContent;
        
        dateAry = rawDate.split(',');
        month = monthMapping[dateAry[0]];
        year = parseInt(dateAry[1]);

        rawAmount = rawInvestment.snapshotItem(2).textContent;
        ary = rawAmount.split('/');
        
        list[i] = { 
            company: company,
            investment: {
              year: year,
              month: month,
              amount: ary[0].trim(),
              stage: ary[1].trim()
            }
        };
      }

      return list;
    }

    return Extractor;

})();
