// THIS WORKS TO INVOKE .addVideoAppLaunchDirective()
// INSPIRED BY DABBLE LABS -- INVOCATION = "TEMPLATE THREE"

const Alexa = require('ask-sdk-core');
const Util = require('./util.js'); //importing the utils class reference

var videoIndex = 0;
var video = 'any';

const STREAM = [
    {
        'slot': 'list',
        'intro': `here is a list of things you can say to get Alexa to show you a video of Elodie and Theo. 
            There are currently six videos that you can choose from. `,
        'urlFile': 'Media/GiantSnakePuppetShow-H.264Podcasting.mp4',  // placeholder
        'prompt': '',
        'prompt2': ''
    },
    {
        'slot': 'puppets',
        'intro': 'here are Elodie and John, performing a puppet show.',
        'urlFile': 'Media/GiantSnakePuppetShow-H.264Podcasting.mp4',
        'prompt': 'puppet show',
        'prompt2': 'to watch a puppet show, '
    },
    {
        'slot': 'baby',
        'intro': 'here is newborn Elodie when she was just one day old, with her mum and dad.',
        'urlFile': 'Media/ElodieDay2.mp4',
        'prompt': 'newborn baby',
        'prompt2': 'or watch a video of newborn Elodie, '
    },
    {
        'slot': 'Theo',
        'intro': 'here\'s a video made two years ago to celebrate the first three years of Theo\'s life. ',
        'urlFile': 'Media/Theo-First3years-720p.mov',
        'prompt': 'Theo',
        'prompt2': 'or a video about Theo\'s first three years of life, '
    },
    {
        'slot': 'snowman',
        'intro': 'here\'s a video made two and a half years ago to celebrate Elodie\'s first snowman. ',
        'urlFile': 'Media/Snowman-YT2_720p.mov',
        'prompt': 'snowman',
        'prompt2': 'or watch a video about Elodie\'s first snowman, '
    },
    {
        'slot': 'train',
        'intro': 'this video was made when Elodie was 16 months old on a trip on a real steam train. ',
        'urlFile': 'Media/SteamySanta2015-720p.mov',
        'prompt': 'steam train',
        'prompt2': 'or a video about Elodie\'s trip on a steam train one Christmas, '
    },
    {
        'slot': 'swimming',
        'intro': `this shows Elodie's first visit to a swimming pool at six months old. 
        Then when she was six <emphasis level="strong">years</emphasis> old. `,
        'urlFile': 'Media/SwimmingWithPostscript-720p.mov',
        'prompt': 'swimming',
        'prompt2': 'or watch one about Elodie\'s attempts at swimming at six months old and then at six <emphasis level="strong">years</emphasis> old.'
    }
    ];

/********************
 * INTENT HANDLERS  *
 ********************
*/

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        let speakOutput = `OK. I can show you videos about John and Leslie's grandchildren, Elodie and Theo. 
        You can choose `;
        for(let i=1; i<STREAM.length; i++) speakOutput += `${STREAM[i].prompt2} `;
            speakOutput += `So you can choose, `;
        for(let i=1; i<STREAM.length; i++) speakOutput += `the ${STREAM[i].prompt} video. Or `;
        speakOutput += `if you don't mind which one you see, just say, any video. 
            That's just, <emphasis level="strong">any video</emphasis>.<break time = "0.3s"/>
            OK, say now what video would you like to watch. `;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('You can just say, <emphasis level="strong">any video</emphasis>. ')
            .getResponse();
    }
};

const ShowVideoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
           handlerInput.requestEnvelope.request.intent.name === 'ShowVideoIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
      );
  },
  handle(handlerInput) {
    //let topic_chosen = handlerInput.requestEnvelope.request.intent.slots.topic.value;
    //handlerInput.requestEnvelope.request.intent.slots.SLOTNAME.value;
    let topic_chosen = handlerInput.requestEnvelope.request.intent.slots.topic.resolutions.resolutionsPerAuthority[0].values[0].value;
    console.log('CONSOLE LOG: topic_chosen = ', topic_chosen);
    // see results on CloudWatch Ireland after running with Device Log ticked on Test tab (console.log() output is preceded by INFO
    let videoClip = null;
    let chat = null;
    
    video = topic_chosen.name;
    // find STREAM[] array index where property 'slot' matches the chosen video slot name
    videoIndex = STREAM.findIndex((vid) => vid.slot === video);
    console.log('CONSOLE LOG: STREAM.findIndex((vid)=> vid.slot === video IS ', STREAM.findIndex((vid) => vid.slot === video));
    
    if (video === 'any') {
        videoIndex = Math.floor(Math.random() * STREAM.length); //The maximum (STREAM.length) is exclusive and the minimum (0) is inclusive;
    }
    console.log('CONSOLE LOG: video, videoIndex = ', video, videoIndex);
    
    videoClip = Util.getS3PreSignedUrl(STREAM[videoIndex].urlFile);
    chat = STREAM[videoIndex].intro;
    
    if(videoIndex>0){  // valid video to be played
    handlerInput.responseBuilder
      .speak(chat)
      .addVideoAppLaunchDirective(videoClip);
    } else {
        
        // maybe instead could try replacing else{} by invoking the LaunchRequestHandler
        // with else return LaunchRequestHandler.handle(handlerInput);
       /* 
        for(let i=1; i<STREAM.length; i++) {
       chat += `Alexa, ask John's grandchildren to show me the video about ${STREAM[i].prompt}. <break time="0.3s"/>`;
        }
        chat += 'Now tell Alexa what to do. '
       console.log('CONSOLE LOG: in "list" bit -- chat = ', chat);
       
       handlerInput.responseBuilder
      .speak(chat)
      // .withShouldEndSession(false) this doesn't work as i expected
      .reprompt(`Say what you video you want Alexa to show, like <emphasis level="strong">steam train</emphasis>, or 
        <emphasis level="strong">snowman</emphasis>, or <emphasis level="strong">Theo</emphasis>, or whatever. `)
      .getResponse();
      */
      
      //invoke the LaunchRequestHandler ..
      return LaunchRequestHandler.handle(handlerInput);
    }
      
    return handlerInput.responseBuilder
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays a chosen video stream when specified. It has no additional functionality.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is a video streaming skill that was modified from a free template from skill templates dot com';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
      );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

// end of INTENT HANDLERS
// *************************

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    ShowVideoIntentHandler,
    //showPuppetsIntentHandler,
    //ShowNewbornIntentHandler,
    CancelAndStopIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
