const fs = require("fs").promises;
const request = require("request");

/**
 * サーバーに書き込みリクエストを投げる
 * 書き込みに失敗するとエラーが出る
 * @param {String} txt 書き込む内容
 */
function changeJson(txt){
    return new Promise((resolve,reject)=>{
        options = {
            uri: "http://nee.php.xdomain.jp/aaa.php",
            headers:{
                "Content-type": "application/json"
            },
            form: {WRITE: txt},
            json: true
        }
        request.post(options, (err,res,body)=>{
            if(err){
                reject(err);
            }
            resolve();
        });
    });
    
}
/**
 * サーバーから売上jsonのオブジェクトを取得する
 * 読み込みに失敗するとエラーが出る
 */
function getJson(){
    return new Promise((resolve,reject)=>{
        options = {
            uri: "http://nee.php.xdomain.jp/aaa.php",
            form: {READ: "aa"},
            json: true
        }
        request.post(options, (err,res,body)=>{
            if(err)reject(err);
            else resolve(body);
        })
    });
}

/**
 * sales.jsonに新しい売り上げ情報を追加する
 * itemidはsales.jsonのitems配列におけるその商品の添え字を表す
 * 読み書きに失敗するとエラーが出る
 * @param {Number} itemid 売り上げた商品ID
 * @param {Number} num 売上個数
 */
async function add_sales(itemid, num){
    let file = await getJson();
    file.sales.push({
        "time": Date.now(),
        "item_id": itemid,
        "num": num,
        "price": file.items[itemid].current_price
    });
    await changeJson(JSON.stringify(file), null, 4);
}
exports.add_sales = add_sales;