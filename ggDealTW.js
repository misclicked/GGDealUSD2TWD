setInterval(()=>{
    {
        var games=$('div.item-list')
        for(var i=0;i<games.length;i++){
            let game = games[i]
            if(game._B_2TW_tag === undefined)
                game._B_2TW_tag = "done"
            else
                continue
            if(!$(game).length)continue;    //is not DOM object
            if($(game).find('span.numeric')[0] === undefined) continue; //not price object
            if($(game).has("img[alt='Steam']").length 
            || $(game).has("span:contains('Steam')").length){  //is steam game
                if($(game).find('.title')[0].textContent === undefined)
                    continue;
                    
                var gameTitle = $(game).find('.title')[0].textContent.toLowerCase();
                
                chrome.runtime.sendMessage({
                    type: 'getPrice',
                    value: gameTitle
                }, function(value){
                    console.log(value);
                    if(value === undefined)return;
                    $(game).find('span.numeric')[0].textContent = value;
                });
            }else{
                var curr = $(game).find('span.numeric')[0].textContent;
                if(curr !== "Free"){
                    chrome.runtime.sendMessage({
                        type: 'convert',
                        value: curr
                    }, function(value){
                        $(game).find('span.numeric')[0].textContent = value;
                    });
                }else{
                    $(game).find('span.numeric')[0].textContent = "免費";
                }
            }
        }
    }
},1000);
