"use strict";

const jsonManater = require('./jsonManager.js');

async function buttonTemplateMaker() {
    let base = {
        type: 'template',
        altText: 'We are sorry but sth is not going well. This should be a button template message.',
        template: {
            type: 'buttons',
            title: '商品価格の変更',
            text: '価格を変更する商品を選んでください',
            actions: [
    
            ]
        }
    };
    
    const database = await jsonManater.getJson();
    const items = database.items;

    for (let i = 0; i < items.length; i++) {
        base.template.actions.push({
            type: 'postback',
            label: item.name,
            data: `select_item ${i}`
        });
    }

    return base;
}

exports.buttonTemplateMaker = buttonTemplateMaker;
