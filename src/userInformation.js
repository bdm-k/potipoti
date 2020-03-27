"use strict";

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

exports.ToggleRichMenuId = ToggleRichMenuId;
