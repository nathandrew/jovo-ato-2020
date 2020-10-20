'use strict';

const {
  App
} = require('jovo-framework');
const {
  Alexa
} = require('jovo-platform-alexa');
const {
  GoogleAssistant
} = require('jovo-platform-googleassistantconv');
const {
  JovoDebugger
} = require('jovo-plugin-debugger');
const {
  FileDb
} = require('jovo-db-filedb');
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
      this.followUpState('AddFiltersQuestionState')
        .ask(this.t('SAVE_AIR_FILTERS'))
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
  // Add Air Filter Locations & Sizes
  // ------------------------------------------------------------------
  AddFiltersQuestionState: {
    YesIntent() {
      this.toStateIntent('AddFiltersState', 'AddAirFilterIntent')
    },
    NoIntent() {
      this.tell(this.t('OK_GOODBYE'));
    }
  },
  AddFiltersState: {
    AddAirFilterIntent() {
      let preamble = '';
      if (this.$session.$data.retryAddFilter) {
        preamble = this.t('SORRY');
      }

      this.ask(`${preamble} ${this.t('WHERE_IS_AIR_FILTER_LOCATED')}`, this.t('WHERE_IS_AIR_FILTER_LOCATED_REPROMPT'));
      this.$session.$data.retryAddFilter = false;
    },
    LocationOfAirFilterIntent() {
      this.$user.$data.location = this.$inputs.location.value;
      this.ask(this.t('WHAT_IS_THE_WIDTH_AND_HEIGHT'), this.t('WHAT_IS_THE_WIDTH_AND_HEIGHT_REPROMPT'))
    },
    SizeOfAirFilterIntent() {
      this.$user.$data.width = this.$inputs.width.value;
      this.$user.$data.height = this.$inputs.height.value;

      let airFilter = {
        width: this.$user.$data.width,
        height: this.$user.$data.height,
        location: this.$user.$data.location
      }
      this.$session.$data.newAirFilter = airFilter
      this.ask(this.t('AIR_FILTER_CONFIRMATION', airFilter), this.t('AIR_FILTER_CONFIRMATION_REPROMPT'));
    },
    YesIntent() {
      if (!this.$user.$data.airFilters) {
        this.$user.$data.airFilters = []
      }
      this.$user.$data.airFilters.push(this.$session.$data.newAirFilter)
      this.followUpState('AddFiltersState.AddAnotherAirFilterState').ask(this.t('ADD_ANOTHER'), this.t('ADD_ANOTHER_REPROMPT'));
    },
    NoIntent() {
      this.$session.$data.retryAddFilter = true;
      this.toIntent('AddAirFilterIntent');
    },
    AddAnotherAirFilterState: {
      YesIntent() {
        this.toStateIntent('AddFiltersState', 'AddAirFilterIntent');
      },
      NoIntent() {
        this.tell(this.t('OK_GOODBYE'));
      }
    }
  },

  ListAirFiltersIntent() {
    const speechBuilder = this.$speech
    speechBuilder.addT('LIST_AIR_FILTERS')
    if (this.$user.$data.airFilters && this.$user.$data.airFilters.length > 0) {
      this.$user.$data.airFilters.forEach(
        function (airFilter) {
          speechBuilder.addT('AIR_FILTER_ITEM', {
            width: airFilter.width,
            height: airFilter.height,
            location: airFilter.location
          })
        }
      );
      speechBuilder.addT('LIST_AIR_FILTERS_ENDING');
      this.tell(speechBuilder)
    } else {
      this.followUpState('AddFiltersQuestionState').ask(this.t('NO_AIR_FILTERS'), this.t('NO_AIR_FILTERS_REPROMPT'))
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

module.exports = {
  app
};
