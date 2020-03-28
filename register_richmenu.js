"use strict";

const fs = require('fs');
const line = require('@line/bot-sdk');
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
}
const client = new line.Client(config);

    /*
NOTE: displayTexts need to be set manually
    */
const uriko = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: true,
    name: 'URIKO',
    chatBarText: 'Toggle',
    areas: [
        // upper left:
      {
        bounds: {
          x: 0,
          y: 0,
          width: 2500,
          height: 1686
        },
        action: {
          type: 'postback',
          // the last 0 means uriko.
          data: 'ADD 0 1 0',
          displayText: 'item0_name +1'
        }
      },
      
        // lower left
      {
        bounds: {
            x: 0,
            y: 843,
        },
        action: {
            type: 'postback',
            // the last 0 means uriko.
            data: 'ADD 1 1 0',
            displayText: 'item1_name +1'
        }
      },

        // upper right
      {
        bounds: {
            x: 1250,
            y: 0,
        },
        action: {
            type: 'postback',
            // the last 0 means "I'm uriko now, but going to be non-uriko"
            data: 'cm 0'
        }
      },

        // lower right
      {
        bounds: {
            x: 1250,
            y: 843,
        },
        action: {
            action: {
                type: 'uri',
                uri: 'https://potipoti.herokuapp.com/static/'
            }
        }
      }
    ]
  }

const non_uriko = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: true,
    name: 'non-URIKO',
    chatBarText: 'Toggle',
    areas: [
        // upper left:
      {
        bounds: {
          x: 0,
          y: 0,
          width: 2500,
          height: 1686
        },
        action: {
          type: 'postback',
          // the last 1 means non-uriko.
          data: 'ADD 0 1 1',
          displayText: 'item0_name +1'
        }
      },
      
        // lower left
      {
        bounds: {
            x: 0,
            y: 843,
        },
        action: {
            type: 'postback',
            // the last 1 menas non-uriko.
            data: 'ADD 1 1 1',
            displayText: 'item1_name +1'
        }
      },

        // upper right
      {
        bounds: {
            x: 1250,
            y: 0,
        },
        action: {
            type: 'postback',
            // the last 1 means "I'm not uriko now, but going to be uriko."
            data: 'cm 1'
        }
      },

        // lower right
      {
        bounds: {
            x: 1250,
            y: 843,
        },
        action: {
            action: {
                type: 'uri',
                uri: 'https://potipoti.herokuapp.com/static/'
            }
        }
      }
    ]
  }

client.createRichMenu(uriko)
  .then(richMenuId => {
      console.log('POST succeeded\r\n', 'URIKO: ', richMenuId);
      client.setRichMenuImage(richMenuId, fs.createReadStream('./tmp/path'));
  })
  .catch(err => {
      console.error('POST failed\r\n', 'error message: ', err);
  });

client.createRichMenu(non_uriko)
  .then(richMenuId => {
      console.log('Request succeeded\r\n', 'non_URIKO: ', richMenuId);
      client.setRichMenuImage(richMenuId, fs.createReadStream('./tmp/path'));
  })
  .catch(err => {
      console.error('Request failed\r\n', 'error message: ', err);
  });
  