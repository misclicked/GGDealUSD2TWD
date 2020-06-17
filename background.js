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
var steamMap = {};
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
                        steamMap[game.name.toLowerCase()] = game.appid;
                    }
                    fuse = new Fuse(data.applist.apps.app, {keys: ['name']});
                }
            });
        }else{
            for(var i=0;i<data.applist.apps.length;i++){
                var game = data.applist.apps[i];
                steamMap[game.name.toLowerCase()] = game.appid;
            }
            fuse = new Fuse(data.applist.apps, {keys: ['name']});
        }
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.type === 'convert') {
        var money = Number(request.value.replace(/[^0-9.-]+/g,""));
        callback( "NT$ " + Math.ceil(money * USD2TWD) );
    }else if (request.type === 'getID'){
        id = steamMap[request.value]
        if(id === undefined)
            id = fuse.search(request.value)[0].item.appid;
        callback({data: id, extra: request.currentID});
        return true;
    }else if (request.type === 'getPrice'){
        var OP  = 'appids='+request.value+'&cc=tw&filters=price_overview';
        console.log(`${steamAPIUrl}${OP}`);
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