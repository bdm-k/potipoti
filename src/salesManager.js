const jsonManager = require("./jsonManager.js");
const userInfo = require("./userInformation.js");
/**
 * sales.jsonに新しい売り上げ情報を追加する
 * itemidはsales.jsonのitems配列におけるその商品の添え字を表す
 * 読み書きに失敗するとエラーが出る
 * @param {Number} itemid 売り上げた商品ID
 * @param {Number} num 売上個数
 * @param {String} userid 売り子のLINEUserID
 * @param {object} client LINE SDK のclient
 */
async function addSales(itemid, num, userid, client){
    let file = await jsonManager.getJson();
    file.sales.push({
        "time": Date.now(),
        "item_id": itemid,
        "num": num,
        "price": file.items[itemid].current_price,
        "user_id": userid,
        "is_uriko": await userInfo.isURIKO(client, userid)
    });
    await jsonManager.changeJson(JSON.stringify(file, null, 4));
}
exports.addSales = addSales;