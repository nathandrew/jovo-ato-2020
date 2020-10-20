'use strict';

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistantconv');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const moment = require('moment')
// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
  LAUNCH() {
      this.followUpState('RecordFilterChangeQuestionState')
        .ask(this.t('WELCOME'));
    },

    // ------------------------------------------------------------------
    // Record an Air Filter was changed
    // ------------------------------------------------------------------
    RecordFilterChangeQuestionState: {
      YesIntent() {
        this.toIntent('RecordChangedAirFilterIntent')
      },
      NoIntent() {
        this.tell("This is not ready yet")
      },
    },

    RecordChangedAirFilterIntent() {
      this.$user.$data.lastChanged = Date.now();
      this.tell(this.t('AIR_FILTER_CHANGE_RECORDED'));
    },

    LastChangedAirFilterIntent() {
      if (this.$user.$data.lastChanged) {
        let dateInWords = moment(this.$user.$data.lastChanged).fromNow();
        this.tell(this.t('YOU_LAST_CHANGED', {
          time: dateInWords
        }));
      } else {
        this.ask(this.t('YOU_NEVER_CHANGED'), this.t('YOU_NEVER_CHANGED_REPROMPT'))
      }
    },

    // ------------------------------------------------------------------
    // Standard Intents
    // ------------------------------------------------------------------
    Unhandled() {
      this.tell(this.t('OOPS'))
    },

    END() {
      if (this.isAlexaSkill()) {
        console.log('Session ended: ' + this.getEndReason());
      } else {
        console.log('Session ended');
      }
    }
});

module.exports = { app };
