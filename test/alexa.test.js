'use strict';

const {
  Alexa
} = require('jovo-platform-alexa');
const moment = require('moment')

jest.setTimeout(500);

let p, testSuite

beforeAll(() => {
  p = new Alexa();
  testSuite = p.makeTestSuite()
})

describe(`ALEXA INTENTS`, () => {
  test('should return a welcome message at LAUNCH', async () => {
    const conversation = testSuite.conversation({
      locale: 'keys-only'
    });

    const launchRequest = await testSuite.requestBuilder.launch();
    const response = await conversation.send(launchRequest);

    expect(response.getSpeech()).toMatch('WELCOME')
  });

  test('should state that the air filter change was recorded', async () => {
    const conversation = testSuite.conversation({
      locale: 'keys-only'
    });

    const launchRequest = await testSuite.requestBuilder.intent('RecordChangedAirFilterIntent')
    const response = await conversation.send(launchRequest);

    expect(response.getSpeech()).toMatch('AIR_FILTER_CHANGE_RECORDED')
    expect(conversation.$user.$data.lastChanged).not.toBeUndefined();
  });

  test('should tell you you have not recorded a change yet', async () => {
    const conversation = testSuite.conversation({
      locale: 'keys-only'
    });

    const launchRequest = await testSuite.requestBuilder.intent('LastChangedAirFilterIntent')
    const response = await conversation.send(launchRequest);

    expect(response.getSpeech()).toMatch('YOU_NEVER_CHANGED')
  });
});
