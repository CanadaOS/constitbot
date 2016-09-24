'use strict';

const express = require('express');
const https = require('https');
const send = require('./fb/send');
const msg = require('./fb/assemble');

const app = express();
app.set('port', process.env.PORT || 5000);

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);

  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  console.log('***webhook data***', JSON.stringify(data));

  /* Ideal State of affairs:
     let handleMessage = receive(data).then((event) => { return handleMsgPromise(event) });
     handleMessage().then((stuff) => { send(stuff).to(user)});
  */

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        const senderID = messagingEvent.sender.id;
        send(msg.text('i got u fam')).to(senderID);
      });

    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
