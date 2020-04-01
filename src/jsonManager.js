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
exports.getJson = getJson;
exports.changeJson = changeJson;