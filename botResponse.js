const request = require('request');

const handleGreetings = (sender_psid, received_message) => {

    response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Select Your Maze Difficulty",
                        "buttons": [
                        {
                            "type": "postback",
                            "title": "Easy (5x5 maze)",
                            "payload": "easy",
                        },
                        {
                            "type": "postback",
                            "title": "Medium (7x7 maze)",
                            "payload": "med",
                        },
                        {
                            "type": "postback",
                            "title": "Hard (9x11 maze)",
                            "payload": "hard",
                        }
                    ],
                }]
            }
        }
    }

    callSendAPI(sender_psid, { 
        'text': `
        Welcome to MazeBot - a small coding challenge maze solver. Our mazebot generates a random maze based on difficulty and it is your job to solve this maze, by coding a solution into the messenger.\nHow Does it work?\nA sample maze:\n🐿️⬛⬛⬛🥜\n⬜⬜⬜⬜⬜\n⬜⬛⬛⬛⬜
        The solution: <d, r, r, d> or <d, loop(r, 2), d>

        Code structure: 
        directions: u <up>, d <down>, l <left>, r <right>, loop(<direction>, <repeat number>)

        If the code has errors, the bot will notify you. 
        if your code hits a wall, or does not reach the target, a visual representation will be sent to you.

        Rules:
        - A single operation is separated by comma.
        - Each direction (u,l,r,d), and loop(<dir>, <repeat>) is a single operation.
        - The code must not hit any walls in order to succeed.
        - The maze will have exactly one solution.

        5x5 (easy), 7x7 (medium), 7x11 (hard)
        ` 
    })
    callSendAPI(sender_psid, response)
}

// Handles messages events
const handleMessage = (sender_psid, received_message, userInfo) => {

}

// Handles messaging_postbacks events
const handlePostback = (sender_psid, received_postback, userInfo) => {
    let response;
    const wallNode = "⬛"
    const openNode = "⬜"
    const start = "🐿️"
    const end = "🥜"
    const maze = userInfo.maze

    let mazeString = ""

    for (let i=1; i<maze.length-1; i++) {
        for (let j=1;j<maze[i].length-1; j++) {
            if (maze[i][j] === 1) {
                mazeString+=wallNode
            } else if (maze[i][j] === 0) {
                if (i === userInfo.start[0] && j === userInfo.start[1]) {
                    mazeString+=start
                } else if (i === userInfo.end[0] && j === userInfo.end[1]) {
                    mazeString+=end
                } else {
                    mazeString+=openNode
                }
            }
        }
        mazeString+="\n"
    }

    // Check if the message contains text
    if (userInfo.solved === false) {    
        // Create the payload for a basic text message
        response = {
            "text": `${mazeString}`
            
        }
    }  else if (userInfo.solved === true) {
        response = {
            "text": "would you like to try another maze?"
        }
    } 
    
    // Sends the response message
    callSendAPI(sender_psid, response)
    callSendAPI(sender_psid, { 'text': `This is your current maze. You may respond with the coded solution, "quit", or "new maze"` })
}

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response) => {
    let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.page_access_token },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}


module.exports = {
    handleMessage,
    handlePostback,
    handleGreetings
}