const steamAPIUrl = 'https://store.steampowered.com/api/appdetails?';
var USD2TWD = 30.0
$.ajax({
    url: 'https://tw.rter.info/capi.php',
    dataType: 'json',
    success: (data)=>{
        USD2TWD = Number(data.USDTWD.Exrate)
    }
});
var fuse;
var steamMap = new Map();
var steamLst = [];
const options = {
    limit: 1,
    allowTypo: false
}
$.ajax({
    url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/',
    dataType: 'json',
    success: (data)=>{
        if(data.applist.apps.length === 0){
            $.ajax({
                url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0001/',
                dataType: 'json',
                success: (data)=>{
                    for(var i=0;i<data.applist.apps.app.length;i++){
                        var game = data.applist.apps.app[i];
                        var gameTitle = game.name;
                        if(steamMap.has(gameTitle)){
                            game.appid = Math.min(Number(game.appid), steamMap.get(gameTitle))
                        };
                        steamMap.set(game.name, Number(game.appid));
                    }
                    steamLst = Array.from(steamMap, ([name, appid]) => ({ name, appid }));
                    steamLst = steamLst.filter(t=>t.namePrepared = fuzzysort.prepare(t.name));
                    steamLst = steamLst.map(t=>t.namePrepared);
                    //console.log(steamMap)
                    //console.log(fuzzysort.go('Crysis 3', steamLst, options)[0].target);
                    //fuse = new Fuse(steamLst, {keys: ['name']});
                    console.log(steamMap);
                }
            });
        }else{
            for(var i=0;i<data.applist.apps.length;i++){
                var game = data.applist.apps[i];
                var gameTitle = game.name;
                if(steamMap.has(gameTitle)){
                    game.appid = Math.min(Number(game.appid), steamMap.get(gameTitle));
                }
                steamMap.set(game.name, Number(game.appid));
            }
            steamLst = Array.from(steamMap, ([name, appid]) => ({ name, appid }));
            steamLst = steamLst.filter(t=>t.namePrepared = fuzzysort.prepare(t.name));
            steamLst = steamLst.map(t=>t.namePrepared);
            //console.log(steamMap)
            //console.log(fuzzysort.go('Crysis 3', steamLst, options)[0].target);
            //fuse = new Fuse(steamLst, {keys: ['name']});
            console.log(steamMap);
        }
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.type === 'convert') {
        var money = Number(request.value.replace(/[^0-9.-]+/g,""));
        callback( "NT$ " + Math.ceil(money * USD2TWD) );
    }else if (request.type === 'getID'){
        result = fuzzysort.go(request.value, steamLst, options)[0].target;
        id = steamMap.get(result);
        console.log(steamMap.has(result));
        console.log(result);
        console.log(steamMap.get(result));
        callback({data: id, extra: request.currentID, fuzzyResult: result});
        return true;
    }else if (request.type === 'getPrice'){
        var OP  = 'appids='+request.value+'&cc=tw&filters=price_overview';
        $.ajax({
            url: `${steamAPIUrl}${OP}`,
            dataType: 'json',
            success: (data)=>{
                callback( {data: data, extra: request.currentID, orgID: request.value} );
            }
        });
        return true;
    }
});