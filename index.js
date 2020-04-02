"use strict";

const express = require('express');
const line = require('@line/bot-sdk');
const crypt = require('crypto');

const salesManager = require("./src/salesManager.js");
const userInfo = require("./src/userInformation.js");
const currentPriceManager = require('./src/currentPriceManager');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
}

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// generally only one element will be set in standby.
// the picture of an element in standby ↓
// [id, selected_item]
// selected_item is initlized as null 
let standby = [];

// set template folder in app
app.use('/static', express.static('template'));

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
    const stirng_body = JSON.stringify(req.body); 
    const signature = crypt.createHmac('SHA256', config.channelSecret).update(stirng_body).digest('base64');
    if (line.validateSignature(stirng_body, config.channelSecret, signature)) {
        res.status(403).end();
    }
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
async function handleEvent(event) {
    event = await shapeEvent(event);
    if (event === 'no data') {
        return null;
    }

// the picture of event
// {
//     id: userId,
//     data: [] <- command sequence
// }
    const command = evnet.data;
    const userId = event.userId;
    const mode = parseInt(event.data[event.data.length - 1], 10);
    
    userInfo.registerUserData(userId, mode);

    switch(command[0]){
        case "ADD":
            // ADD item_id num uriko_state
            if(command.length != 4){
                console.log(`The length of command ADD should be 4: ${command}`);
                break;
            }
            if(isNaN(itemid) || isNaN(num)){
                console.log(`Given value is not Integer: ${command}`);
                break;
            }
            const itemid = parseInt(command[1], 10);
            const num = parseInt(command[2], 10);
            return await salesManager.addSales(itemid, num, userId)
                .then(()=>Promise.resolve(null))
                .catch((err)=>{
                    console.log("updating sales data failed:", err);
                    return client.replyMessage(event.replyToken, {
                        type: "text",
                        text: "送信エラー。もう一度お試しください。"
                    });
                });

        case 'change_uriko_mode':
            userInfo.ToggleRichMenuId(client, userId, mode);

        case 'change_current_price':
            currentPriceManager.buttonTemplateMaker()
                .then(x => {
                    standby.push([userId, null]);
                    return client.replyMessage(event.replyToken, x);
                })
                .catch(err => {
                    console.log('making a template message failed: \r\n', err);
                    return client.replyMessage(event.replyToken, {
                        type: "text",
                        text: "予期しないエラーが発生\n猫派または国駿にお問い合わせください"
                    });
                });

        case 'select_item':
            let itemId = parseInt(command[1], 10);
            for (let user of standby) {
                if (user[0] === userId) {
                    user[1] = itemId;
                }
            };
            return client.replyMessage(event.replyToken, {
                type: "text",
                text: "新しく設定する価格を半角数字で入力してください"
            });
    }
    
    return null;
}

async function shapeEvent(event) {
    if (event.type === 'postback') {
        return Promise.resolve({
            id: event.source.userId,
            data: event.postback.data.split(' ')
        });
    } 
    if (event.type === 'message' && event.message.type === 'text') {
        let command = event.message.text.split(' ');
        if (command.length === 3) {
            const userId = event.source.userId;
            let isUriko = await userInfo.isURIKO(client, userId);
            let urikoState = (isUriko) ? userInfo.MODE_ON : userInfo.MODE_OFF;
            command.push(`${urikoState}`);
            return Promise.resolve({
                id: userId,
                data: command
            });
        } else if (command.length === 4) {
            return Promise.resolve({
                id: event.source.userId,
                data: command
            });
        } else if (command.length === 1 && parseInt(command[0]) !== NaN) {
            return Promise.resolve({
                id: event.source.userId,
                data: ['probably_new_price', command[0]]
            });
        }
    }
    return Promise.resolve('no data');
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
})
