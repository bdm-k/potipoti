"use strict";

// On URIKO mode(index: 0) or Off URIKO mode(index: 1)
const richMenuIds = [];

function ToggleRichMenuId(client, userId, index) {
    let another = (index === 0) ? 1 : 0
    client.linkRichMenuToUser(richMenuIds[another], userId);
}

exports.ToggleRichMenuId = ToggleRichMenuId;
