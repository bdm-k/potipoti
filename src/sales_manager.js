const fs = require("fs").promises;

const json_path = "sales.json";

/**
 * sales.jsonに新しい売り上げ情報を追加する
 * itemidはsales.jsonのitems配列におけるその商品の添え字を表す
 * 書き込みに失敗した場合ログにエラーを流す
 * どのような結果になったとしても、Promise.resolve(null)を返す
 * ↑index#handleEvent関数でそのままreturnしたいので。。。
 * @param {Number} itemid 売り上げた商品ID
 * @param {Number} num 売上個数
 */
function add_sales(itemid, num){
    fs.readFile(json_path).then(result=>{
        let file = JSON.parse(result);
        file.sales.push({
            "time": Date.now(),
            "item_id": itemid,
            "num": num,
            "price": file.items[itemid].current_price
        });
        return fs.writeFile(json_path, JSON.stringify(file, null, 4));
    }).catch(err=>{
        console.error("Reading sales.json failed due to following error(s):");
        console.error(err);
    });
    return Promise.resolve(null);
}
exports.add_sales = add_sales;