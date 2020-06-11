const cors = 'https://misclicked.dynv6.net:8080/';
const redirectChecker = 'https://misclicked.dynv6.net:9090/?p='
const ggDealLink2Steam = 'https://misclicked.dynv6.net:10010/?p='
const currencyUrl = 'https://tw.rter.info/capi.php';
const steamAPIUrl = 'https://store.steampowered.com/api/appdetails?';
const formatter = new Intl.NumberFormat('zh-TW', 
{style: 'currency',currency: 'TWD'});
let requestStr = 'appids='+1057090+'&cc=tw&filters=price_overview';
$.getJSON(`${cors}${currencyUrl}`, (data) => {
    let exrate = data['USDTWD'].Exrate;
    numerics = $('span.numeric');
    for (var i=0;i<numerics.length;i++){
        let currency = numerics[i].textContent;
        let sUSD = currency.replace(/[^0-9.-]+/g,"");
        var USD;
        if(sUSD!==''){
            USD = Number(sUSD);
            let TWD = USD * exrate;
            numerics[i].textContent = formatter.format(TWD);
        }else{
            numerics[i].textContent = "免費"
        }
    }
    var steamGames=$('div.game-list-item').has("img[alt='Steam']")
    for (var i=0;i<steamGames.length;i++){
        let shopLink = $(steamGames[i]).find('.shop-link')[0];
        $.ajax({
            url: `${redirectChecker}${shopLink}`,
            indexValue : i,
            success: function(steamUrl){
                let parsedUrl = steamUrl.split('/');
                let gameID = parsedUrl[parsedUrl.length-2];
                let requestStr = 'appids='+gameID+'&cc=tw&filters=price_overview';
                let id = this.indexValue;
                $.ajax({
                    url: `${cors}${steamAPIUrl}${requestStr}`,
                    indexValue: this.indexValue,
                    gameID: gameID,
                    dataType: 'json',
                    success: function(data) {
                        let TWD = data[this.gameID]['data']["price_overview"]['final_formatted'].replace(/[^0-9.-]+/g,"");;
                        if(TWD!=="免費"){
                            let nTWD = Number(TWD.substring(3));
                            nTWD = formatter.format(nTWD);
                            $(steamGames[this.indexValue]).find('span.numeric')[0].textContent = nTWD;
                        }else{
                            $(steamGames[this.indexValue]).find('span.numeric')[0].textContent = TWD;
                        }
                    }
                  });
            }
        })
    }
    var steamGames2=$('div.game-list-item').has("span:contains('Steam')")
    for (var i=0;i<steamGames2.length;i++){
        let ggLink = $(steamGames2[i]).find('a.full-link')[0].href;
        $.ajax({
            url: `${ggDealLink2Steam}${ggLink}`,
            indexValue : i,
            success: function(shopLink){
                $.ajax({
                    url: `${redirectChecker}${shopLink}`,
                    indexValue : this.indexValue,
                    success: function(steamUrl){
                        let parsedUrl = steamUrl.split('/');
                        let gameID = parsedUrl[parsedUrl.length-2];
                        let requestStr = 'appids='+gameID+'&cc=tw&filters=price_overview';
                        let id = this.indexValue;
                        $.ajax({
                            url: `${cors}${steamAPIUrl}${requestStr}`,
                            indexValue: this.indexValue,
                            gameID: gameID,
                            dataType: 'json',
                            success: function(data) {
                                let TWD = data[this.gameID]['data']["price_overview"]['final_formatted'].replace(/[^0-9.-]+/g,"");;
                                if(TWD!=="免費"){
                                    let nTWD = Number(TWD.substring(3));
                                    nTWD = formatter.format(nTWD);
                                    $(steamGames2[this.indexValue]).find('span.numeric')[0].textContent = nTWD;
                                }else{
                                    $(steamGames2[this.indexValue]).find('span.numeric')[0].textContent = TWD;
                                }
                            }
                          });
                    }
                })
            }
        })
    }
});