const jsonManager = require("./jsonManager.js");
/**
 * sales.jsonに新しい売り上げ情報を追加する
 * itemidはsales.jsonのitems配列におけるその商品の添え字を表す
 * 読み書きに失敗するとエラーが出る
 * @param {Number} itemid 売り上げた商品ID
 * @param {Number} num 売上個数
 */
async function addSales(itemid, num){
    let file = await jsonManager.getJson();
    file.sales.push({
        "time": Date.now(),
        "item_id": itemid,
        "num": num,
        "price": file.items[itemid].current_price
    });
    await jsonManager.changeJson(JSON.stringify(file, null, 4));
}
exports.addSales = addSales;