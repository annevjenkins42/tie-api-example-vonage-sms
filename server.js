/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http');
const https = require('https');
const express = require('express');
const qs = require('querystring');
const TIE = require('@artificialsolutions/tie-api-client');
const nexmoSMSRequest = require('request');
require('dotenv').config();


const config = {
  teneoURL: process.env.TENEO_ENGINE_URL,
  nexmoNumber: process.env.NEXMO_NUMBER,
  nexmoApiKey: process.env.NEXMO_API_KEY,
  nexmoApiSecret: process.env.NEXMO_API_SECRET,
  port: process.env.PORT
};


const port = config.port || 1337;
const teneoApi = TIE.init(config.teneoURL);

// Initialise session handler, to store mapping between a Nexmo number and an engine session id
const sessionHandler = SessionHandler();

// Initialize an Express application
const app = express();
const router = express.Router()

// Tell express to use this router with /api before.
app.use("/", router);

// Nexmo message comes in
router.post("/teneochat", teneoChat(sessionHandler));

// Send a Nexmo SMS
router.post("/sendsms", sendNexmoSMSMessage());

// Send a SMS - standlone API call for SMS sends during Teneo dialogue
function sendNexmoSMSMessage() {

  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

      var post = JSON.parse(body);

      // Send text response to user via Nexmo SMS
      sendSMS(post.phoneNumber, post.message);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
  }
}


// Send a SMS
function sendSMS(phoneNumber, message) {
	var postData = JSON.stringify({
	    'from' : config.nexmoNumber,
	    'to'   : phoneNumber,
	     'message_type': 'text',
	     'text'	: message,
	     'channel' : 'whatsapp'
	});

	var options = {
	  hostname: 'https://messages-sandbox.nexmo.com',
	  port: 443,
	  path: '/v1/messages',
	  method: 'POST',
	  authorization : {
        	username: 'd7a7df85',
        	password: '5LGQImJ4i8NxWfHW'
    	  }	
	  headers: {
	       'Content-Type': 'application/x-www-form-urlencoded',
	       'Content-Length': postData.length
	     }
	};
	
	console.log('postData = ' + postData);

	var req2 = https.request(options, (res2) => {
	  console.log('statusCode:', res2.statusCode);
	  console.log('headers:', res2.headers);
	
	  res2.on('data', (d) => {
	    process.stdout.write(d);
	  });
	});
	
	req2.on('error', (e) => {
	  console.error(e);
	});
	
	req2.write(postData);
	req2.end();
	/*nexmoSMSRequest.post('https://messages-sandbox.nexmo.com/v1/messages', {
		json: {
			from: config.nexmoNumber,
			to: phoneNumber,
			message_type: "text",
			api_key: config.nexmoApiKey,
			api_secret: config.nexmoApiSecret,
			text: message,
			channel: "whatsapp"
		}
	}, (error, response, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log('Status code from Nexmo SMS Send: ${response.statusCode}')
		console.log('Sent message <<' + message + '>> to number <<' + phoneNumber + '>>');
	});*/
}

function _stringify (o)
{
  const decircularise = () =>
  {
    const seen = new WeakSet();
    return (key,val) => 
    {
      if( typeof val === "object" && val !== null )
      {
        if( seen.has(val) ) return;
        seen.add(val);
      }
      return val;
    };
  };
  
  return JSON.stringify( o, decircularise() );
}

// Handle incoming Nexmo message
function teneoChat(sessionHandler) {

  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {
     //console.log(_stringify(req));
     console.log(_stringify(body));
      var post = qs.parse(body);
     const obj = JSON.parse(body);
      const callingPhoneNumber = obj.from;
      var input = obj.text;
      var mediaUrl = '';
       
       console.log("post = " + _stringify(post));
       console.log("input = " + input);
      if(input===undefined) {
	      mediaUrl = obj.image;
	      if(mediaUrl!==undefined) {
		      mediaUrl = obj.image.url;
		      input= obj.image.caption;
	      }
      }      
      console.log("WhatsApp from " + callingPhoneNumber + " was: " + input + " with mediaUrl= "+ mediaUrl);

      // Check if we have stored an engine sessionid for this caller
      const teneoSessionId = sessionHandler.getSession(callingPhoneNumber);

      // Send the user's input from the SMS to Teneo, and obtain a response
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': input, 'channel': 'vonage-whatsapp', 'phoneNumber': callingPhoneNumber, 'mediaUrl':mediaUrl});
      console.log("response="+teneoResponse.output.text);
      console.log(_stringify(teneoResponse));
      // Stored engine sessionid for this caller
      sessionHandler.setSession(callingPhoneNumber, teneoResponse.sessionId);

      // Send text response to user via Nexmo SMS
      sendSMS(callingPhoneNumber, teneoResponse.output.text)

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('');
    });
  }
}

/***
 * SESSION HANDLER
 ***/

function SessionHandler() {

  // Map the Nexmo Phone Number to the Teneo Engine Session ID.
  // This code keeps the map in memory, which is ok for demo purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis
  const sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      }
      else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId)
    }
  };
}

// start the express application
http.createServer(app).listen(port, () => {
  if(config.port==undefined){
    console.log(`PORT is undefined. Please check that .env file exists and that its settings are correct.`)
  }
  else{
    console.log(`Listening on port: ${config.port}`);
  }
});
