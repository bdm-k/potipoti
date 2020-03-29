"use strict";

const express = require('express');
const line = require('@line/bot-sdk');
const crypt = require('crypto');

const salesManager = require("./src/salesManager.js")
const userInfo = require("./src/userInformation.js")

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
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const command = event.message.text.split(' ');
    if(command.length == 0){
        return Promise.resolve(null);
    }
    
    userInfo.registerUserData(event.source.userId);

    switch(command[0]){
        case "ADD":
            //ADD item_id num
            if(command.length != 3)break;
            const itemid = parseInt(command[1], 10);
            const num = parseInt(command[2], 10);
            if(isNaN(itemid) || isNaN(num))break;
            return salesManager.addSales(itemid, num, event.source.userId, client).
                then(()=>Promise.resolve(null))
                .catch((err)=>{
                    console.log("updating sales data failed:", err);
                    return client.replyMessage(event.replyToken, {
                        type: "text",
                        text: "送信エラー。もう一度お試しください。"
                    });
                });
    }
    return Promise.resolve(null);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
})