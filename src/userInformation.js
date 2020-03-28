"use strict";

const jsonManager = require("./jsonManager.js");
const request = require("request");

// On URIKO mode(index: 0) or Off URIKO mode(index: 1)
const richMenuIds = [];

function isURIKO(id) {
    return id === richMenuIds[0]
}

function anotherId(id) {
    return (id === richMenuIds[0]) ? richMenuIds[1] : richMenuIds[0];
}

    /*
NOTE: ToggleRichMenuId doesn't have error handling process .catch.
    */
function ToggleRichMenuId(client, userId) {
    return client.getRichMenuIdOfUser(userId)
        .then(richMenuId => {
            client.linkRichMenuToUser(anotherId(richMenuId), userId);
            return isURIKO(richMenuId);
        })
}

/**
 * 与えられたuserIDのユーザ情報をsales.jsonから読み出す
 * 存在しないユーザーだった場合エラーを送出する
 */
async function getUserData(userid){
    const database = await jsonManager.getJson();
    if(!database.users[userid]){
        throw Error(`Error: A user with id:${userid} does not exist.`);
    }
    return database.users[userid];
}

/**
 * 与えられたuserIDのユーザ情報をsales.jsonに登録する
 * 既に登録されてる場合は更新処理になる
 * jsonの読み書きに失敗した場合エラーを送出する
 * ユーザ情報の取得に失敗した場合ダミーの情報を返す(LINEのバージョンが古い場合取得に失敗するため)
 */
async function registerUserData(userid){
    let database = await jsonManager.getJson();

    options = {
        uri: `https://api.line.me/v2/bot/profile/${userid}`,
        headers:{
            Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
        },
        json: true
    };
    try{
        const userData = await new Promise((resolve,reject)=>{
            request.get(options, (err,res,body)=>{
                if(err){
                    reject(err);
                }
                resolve(body);
            })
        });
        database.users[userid] = {
            user_name: userData.displayName,
            photo: userData.pictureUrl
        };
        console.log(userData);
        console.log(database.users);
        console.log(process.env.CHANNEL_ACCESS_TOKEN);
    
        
    }catch(err){
        console.error(`Userdata registration failed(userid: ${userid}):`, err);
        database.users[userid] = {
            user_name: "Unknown",
            photo: ""
        };
    }finally{
        await jsonManager.changeJson(JSON.stringify(database, null, 4));
    }
}

exports.ToggleRichMenuId = ToggleRichMenuId;
exports.registerUserData = registerUserData;
exports.getUserData = getUserData;
