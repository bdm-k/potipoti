"use strict";
// This is to make unit instance.
// Don't think too much, just handle unit as a plain object.
function unit(e, l) {
    this.time = e.time;
    this.data = [];
    for (let i = 0; i < l; i++) {
        this.data.push({
            num: 0,
            sales: 0
        });
    }
    this.data[e.item_id].num = e.num;
    this.data[e.item_id].sales = e.num*e.price;
}

// method:update is what unit is all about. It helps simplyfying for-sentence in getCumulativeSales.
unit.prototype.update = function(e) {
    this.time = e.time;
    this.data[e.item_id].num += e.num;
    this.data[e.item_id].sales += e.num*e.price;
}
unit.prototype.minutes = function() {
    return (new Date(this.time)).getMinutes();
}

// recieve sales.json'object, return [unit].
// look over Pull Request for the account of unit.
function getCumulativeSales(unprocessedobj) {
    let items = unprocessedobj.items, sales = unprocessedobj.sales;
    let cumulative = [], currentobj;
    for (let i = 0; i < sales.length; i++) {
        let event = sales[i]
        if (!currentobj) {
            currentobj = new unit(event, items.length);
            continue;
        }
        if ((new Date(event.time)).getMinutes() !== currentobj.minutes()) {
            cumulative.push(currentobj);
        }
        currentobj.update(event);
    }
    return cumulative
}

module.exports = getCumulativeSales;

