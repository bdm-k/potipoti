"use strict";

// initlize variable:curretobj in getCumulativeSales
function init(e, l) {
    let obj = {
        time: e.time,
        data: []
    }
    for (let i = 0; i < l; i++) {
        obj.data.push({
            num: 0,
            sales: 0
        });
    }
    obj.data[e.item_id].num = e.num;
    obj.data[e.item_id].sales = e.num*e.price;
    return obj;
}

// recieve sales.json'object, return [object].
// look over Pull Request for the account of getCumulativeSales.
function getCumulativeSales(unprocessedobj) {
    let item_length = unprocessedobj.items.length, sales = unprocessedobj.sales;
    let cumulative = [], currentobj;
    if (sales.length === 1) {
        return [init(sales[0], item_length)]
    }
    for (let i = 0; i < sales.length; i++) {
        let event = sales[i]
        if (!currentobj) {
            currentobj = init(event, item_length);
            continue;
        }
        if ((new Date(event.time)).getMinutes() !== (new Date(currentobj.time)).getMinutes()) {
            cumulative.push(JSON.parse(JSON.stringify(currentobj)));
        }
        currentobj.time = event.time;
        currentobj.data[event.item_id].num += event.num;
        currentobj.data[event.item_id].sales += event.num*event.price;
    }
    cumulative.push(Object.assign({}, currentobj));
    return cumulative
}

