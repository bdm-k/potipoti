"use strict";

const jsonManager = require("./jsonManager.js");
const request = require("request");

// On URIKO mode(index: 0) or Off URIKO mode(index: 1)
const richMenuIds = [];

const MODE_ON = 0;
const MODE_OFF = 1;

function isURIKO(client, userid) {
    return client.getRichMenuIdOfUser(userid)
            .then((menuid)=>menuid === richMenuIds[MODE_ON]);
}

function ToggleRichMenuId(client, userId, mode) {
    let another = (mode === MODE_ON) ? MODE_OFF : MODE_ON;
    client.linkRichMenuToUser(richMenuIds[another], userId);
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
async function registerUserData(client, userid){
    let database = await jsonManager.getJson();

    const isUriko = await isURIKO(client, userid);

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
            photo: userData.pictureUrl,
            currently_is_uriko: isUriko
        };
    
        
    }catch(err){
        console.error(`Userdata registration failed(userid: ${userid}):`, err);
        database.users[userid] = {
            user_name: "Unknown",
            photo: "",
            currently_is_uriko: isUriko
        };
    }finally{
        await jsonManager.changeJson(JSON.stringify(database, null, 4));
    }
}

exports.ToggleRichMenuId = ToggleRichMenuId;
exports.registerUserData = registerUserData;
exports.getUserData = getUserData;
exports.isURIKO = isURIKO;