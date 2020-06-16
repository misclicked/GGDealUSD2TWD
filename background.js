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
$.ajax({
    url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/',
    dataType: 'json',
    success: (data)=>{
        if(data.applist.apps.length === 0){
            $.ajax({
                url: 'http://api.steampowered.com/ISteamApps/GetAppList/v0001/',
                dataType: 'json',
                success: (data)=>{
                    fuse = new Fuse(data.applist.apps, {keys: ['name']});
                }
            });
        }else{
            fuse = new Fuse(data.applist.apps, {keys: ['name']});
        }
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.type == 'convert') {
        var money = Number(request.value.replace(/[^0-9.-]+/g,""));
        callback( "NT$ " + Math.ceil(money * USD2TWD) );
        return true;
    }else if (request.type == 'getPrice'){
        id = fuse.search(request.value)[0].item.appid;
        var OP  = 'appids='+id+'&cc=tw&filters=price_overview';
        $.ajax({
            url: `${steamAPIUrl}${OP}`,
            dataType: 'json',
            success: (data)=>{
                console.log(data);
                price = data[id].data.price_overview.final_formatted;
                console.log(price); 
                callback( price );
            }
        });
        return true;
    }
});