'use strict';

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: 'SessionSpeechlet - ${title}',
            content: 'SessionSpeechlet - ${output}',
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Hi, my name is Alexa. Welcome to the Tenerife Dev talk about Amazon Echo and the internet of voice. Today your host  will show you how to write your own skills using node JS, and also the dot net framework. This way you can get ahead of the rest and start developing applications with voice today. I hope that you will enjoy it. Speak to you later.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = '';
    const shouldEndSession = true;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for your attention. I hope you\'ve learned something today and perhaps will even try to write Alexa skill your self. Have a nice evening!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function createFavoriteLanguageAttributes(favoriteLanguage) {
    return {
        favoriteLanguage,
    };
}

/**
 * Sets the language in the session and prepares the speech to reply to the user.
 */
function setLangaugeInSession(intent, session, callback) {
    const cardTitle = intent.name;
    const favoriteLanguageSlot = intent.slots.Language;
    let repromptText = '';
    let sessionAttributes = {};
    const shouldEndSession = false;
    let speechOutput = '';

    if (favoriteLanguageSlot) {
        const favoriteLanguage = favoriteLanguageSlot.value;
        console.log(favoriteLanguageSlot.value);
        sessionAttributes.favoriteLanguage = favoriteLanguage;
        speechOutput = `I now know your favorite programming language is ${favoriteLanguage}. You can ask me ` +
            "what's my favorite programming language?";
        repromptText = "You can ask me your favorite programming language by saying, what's my favorite programming language?";
        console.log(JSON.stringify(sessionAttributes));


    } else {
        speechOutput = "I'm not sure what your favorite language is. Please try again.";
        repromptText = "I'm not sure what your favorite language is. You can tell me your " +
            'favorite programming language by saying, my favorite programming language is C Sharp';
    }

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function getRandomArbitrary(min, max) {

    return Math.round(Math.random() * (max - min) + min);

}

function getRandomNumber(intent, session, callback) {
    let upLimit = 0;
    let lowLimit = 0;
    let shouldEndSession = false;
    let speechOutput = '';

    const repromptText = null;
    const sessionAttributes = {};

    if (intent.slots.UpLimit)
        upLimit = parseInt(intent.slots.UpLimit.value);

    if (intent.slots.LowLimit)
        lowLimit = parseInt(intent.slots.LowLimit.value);

    if (upLimit === 0 || lowLimit === 0) {
        speechOutput = 'Sorry, you did not specify the low and up limits for the random number.';

    }
    else {
        console.log("RANDOM NUMBER min: " + lowLimit);
        console.log("RANDOM NUMBER max: " + upLimit);

        //obtain random number
        let randomNum = getRandomArbitrary(lowLimit, upLimit);
        speechOutput = 'The random number between ' + lowLimit + ' and ' + upLimit + ' is ' + randomNum + '.';
    }

    shouldEndSession = true;


    callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.

}

function getLanguageFromSession(intent, session, callback) {
    let favoriteLanguage;
    const repromptText = null;
    const sessionAttributes = {};
    let shouldEndSession = false;
    let speechOutput = '';
    console.log(JSON.stringify(session.attributes));

    if (session.attributes) {
        favoriteLanguage = session.attributes.favoriteLanguage;
    }

    if (favoriteLanguage) {
        speechOutput = `Your favorite language is ${favoriteLanguage}, Goodbye.`;
        shouldEndSession = true;
    }
    else {
        speechOutput = "I'm not sure what your favorite language is, you can say, my favorite language " + ' is C Sharp';
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}');
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log('onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}');

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log('onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}');

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'MyLanguageIsIntent') {
        setLangaugeInSession(intent, session, callback);
    }
    else if (intentName === 'WhatsMyLanguageIntent') {
        getLanguageFromSession(intent, session, callback);
    }
    else if (intentName === 'GetRandomNumberIntent') {
        getRandomNumber(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log('event.session.application.applicationId=${event.session.application.applicationId}');

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
