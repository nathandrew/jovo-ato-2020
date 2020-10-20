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
});
