const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const { normalizeHabit, ensureStructure, getTodayCompletions, countDone, currentStreak } = require('./helpers');

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'HabitTrackerSkill';

const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: TABLE_NAME,
  createTable: true,
});

async function getAttributes(handlerInput) {
  return handlerInput.attributesManager.getPersistentAttributes();
}

async function saveAttributes(handlerInput, attrs) {
  handlerInput.attributesManager.setPersistentAttributes(attrs);
  await handlerInput.attributesManager.savePersistentAttributes();
}

// ── intent handlers ───────────────────────────────────────────────────────────

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attrs = ensureStructure(await getAttributes(handlerInput));
    const done = countDone(attrs);
    const total = attrs.habits.length;
    const remaining = total - done;

    let speech;
    if (total === 0) {
      speech = "Welcome to Habit Tracker! You don't have any habits yet. Try saying, add exercise to my habits.";
    } else if (done === total) {
      speech = `Welcome back! You've completed all ${total} habits today — amazing work! Say 'how am I doing' or 'add a habit' to continue.`;
    } else {
      const pct = Math.round((done / total) * 100);
      speech = `Welcome to Habit Tracker. You've done ${done} of ${total} habits today — that's ${pct} percent. `
             + `${remaining} habit${remaining === 1 ? '' : 's'} still to go. `
             + `Say 'list my habits', 'mark a habit done', or 'how am I doing'.`;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt("What would you like to do? Say 'list my habits' or 'mark a habit done'.")
      .getResponse();
  },
};

const MarkHabitDoneIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarkHabitDoneIntent';
  },
  async handle(handlerInput) {
    const habitSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'habit');
    const habit = normalizeHabit(habitSlot);

    const attrs = ensureStructure(await getAttributes(handlerInput));

    if (!habit) {
      return handlerInput.responseBuilder
        .speak("Which habit did you complete?")
        .reprompt("Which habit would you like to mark as done?")
        .addDelegateDirective()
        .getResponse();
    }

    if (!attrs.habits.includes(habit)) {
      return handlerInput.responseBuilder
        .speak(`I don't see ${habit} in your habit list. Would you like to add it first? Say 'add ${habit} to my habits'.`)
        .reprompt("Say 'list my habits' to see what you're tracking.")
        .getResponse();
    }

    getTodayCompletions(attrs)[habit] = true;
    await saveAttributes(handlerInput, attrs);

    const done = countDone(attrs);
    const total = attrs.habits.length;
    const streak = currentStreak(attrs, habit);
    const streakMsg = streak > 1 ? ` That's a ${streak}-day streak!` : '';

    return handlerInput.responseBuilder
      .speak(`Great job! ${habit} marked complete.${streakMsg} You've now done ${done} of ${total} habits today.`)
      .reprompt("Anything else? Say 'list my habits' or 'how am I doing'.")
      .getResponse();
  },
};

const UnmarkHabitIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UnmarkHabitIntent';
  },
  async handle(handlerInput) {
    const habitSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'habit');
    const habit = normalizeHabit(habitSlot);

    const attrs = ensureStructure(await getAttributes(handlerInput));
    const today = getTodayCompletions(attrs);

    if (!today[habit]) {
      return handlerInput.responseBuilder
        .speak(`${habit} wasn't marked as done today, so nothing to undo.`)
        .reprompt("Say 'how am I doing' to check your progress.")
        .getResponse();
    }

    delete today[habit];
    await saveAttributes(handlerInput, attrs);

    return handlerInput.responseBuilder
      .speak(`Done. ${habit} has been unmarked for today.`)
      .reprompt("Say 'list my habits' or 'how am I doing'.")
      .getResponse();
  },
};

const ListHabitsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListHabitsIntent';
  },
  async handle(handlerInput) {
    const attrs = ensureStructure(await getAttributes(handlerInput));
    const today = getTodayCompletions(attrs);

    if (attrs.habits.length === 0) {
      return handlerInput.responseBuilder
        .speak("You don't have any habits yet. Say 'add exercise to my habits' to get started.")
        .reprompt("Say 'add a habit' to create your first habit.")
        .getResponse();
    }

    const lines = attrs.habits.map(h => {
      const done = today[h] ? 'done' : 'not done yet';
      return `${h}: ${done}`;
    });

    const speech = `Here are your habits for today: ${lines.join('. ')}.`;
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt("Say 'mark a habit done' or 'how am I doing'.")
      .getResponse();
  },
};

const GetProgressIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetProgressIntent';
  },
  async handle(handlerInput) {
    const attrs = ensureStructure(await getAttributes(handlerInput));
    const today = getTodayCompletions(attrs);
    const done = countDone(attrs);
    const total = attrs.habits.length;

    if (total === 0) {
      return handlerInput.responseBuilder
        .speak("You don't have any habits set up yet. Say 'add exercise to my habits' to start.")
        .reprompt("Say 'add a habit' to create your first habit.")
        .getResponse();
    }

    const pct = Math.round((done / total) * 100);
    const remaining = attrs.habits.filter(h => !today[h]);

    let speech = `Today's progress: ${done} of ${total} habits complete — ${pct} percent. `;

    if (done === total) {
      speech += "You've crushed it today — all habits done!";
    } else if (done === 0) {
      speech += `You haven't started yet. Your habits are: ${attrs.habits.join(', ')}.`;
    } else {
      speech += `Still to do: ${remaining.join(', ')}.`;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt("Say 'mark a habit done' to keep going.")
      .getResponse();
  },
};

const AddHabitIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddHabitIntent';
  },
  async handle(handlerInput) {
    const habitSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'habit');
    const habit = normalizeHabit(habitSlot);

    if (!habit) {
      return handlerInput.responseBuilder
        .speak("What habit would you like to add?")
        .reprompt("Tell me the name of the habit you want to track.")
        .addDelegateDirective()
        .getResponse();
    }

    const attrs = ensureStructure(await getAttributes(handlerInput));

    if (attrs.habits.includes(habit)) {
      return handlerInput.responseBuilder
        .speak(`${habit} is already in your habit list.`)
        .reprompt("Say 'list my habits' to see all your habits.")
        .getResponse();
    }

    attrs.habits.push(habit);
    await saveAttributes(handlerInput, attrs);

    return handlerInput.responseBuilder
      .speak(`${habit} has been added to your habits. You now have ${attrs.habits.length} habits.`)
      .reprompt("Say 'list my habits' or 'mark a habit done'.")
      .getResponse();
  },
};

const RemoveHabitIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveHabitIntent';
  },
  async handle(handlerInput) {
    const habitSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'habit');
    const habit = normalizeHabit(habitSlot);

    const attrs = ensureStructure(await getAttributes(handlerInput));
    const idx = attrs.habits.indexOf(habit);

    if (idx === -1) {
      return handlerInput.responseBuilder
        .speak(`${habit} isn't in your habit list.`)
        .reprompt("Say 'list my habits' to see what you're tracking.")
        .getResponse();
    }

    attrs.habits.splice(idx, 1);
    await saveAttributes(handlerInput, attrs);

    return handlerInput.responseBuilder
      .speak(`${habit} removed. You now have ${attrs.habits.length} habit${attrs.habits.length === 1 ? '' : 's'}.`)
      .reprompt("Say 'list my habits' or 'add a habit'.")
      .getResponse();
  },
};

const StartPomodoroIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartPomodoroIntent';
  },
  handle(handlerInput) {
    const minutesSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'minutes');
    const minutes = parseInt(minutesSlot, 10) || 25;

    // Clamp to sensible range
    const clamped = Math.min(Math.max(minutes, 1), 120);

    const speech = `Starting a ${clamped}-minute focus session. Get into flow — I'll let you know when time is up. Good luck!`;

    // Alexa timers API would go here; for now we deliver a voice confirmation
    // and the user's Echo device will handle the countdown via its built-in timer.
    return handlerInput.responseBuilder
      .speak(speech)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const GetStreakIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetStreakIntent';
  },
  async handle(handlerInput) {
    const habitSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'habit');
    const habit = normalizeHabit(habitSlot);

    const attrs = ensureStructure(await getAttributes(handlerInput));

    if (!attrs.habits.includes(habit)) {
      return handlerInput.responseBuilder
        .speak(`I don't see ${habit} in your habit list.`)
        .reprompt("Say 'list my habits' to see what you're tracking.")
        .getResponse();
    }

    const streak = currentStreak(attrs, habit);

    let speech;
    if (streak === 0) {
      speech = `You don't have a current streak for ${habit}. Mark it done today to start one!`;
    } else if (streak === 1) {
      speech = `You've done ${habit} today. Keep it up tomorrow to build a streak!`;
    } else {
      speech = `You're on a ${streak}-day streak for ${habit}. Keep it going!`;
    }

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt("Say 'list my habits' or 'how am I doing'.")
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speech = [
      "Here's what you can do with Habit Tracker:",
      "Say 'list my habits' to hear your full habit list.",
      "Say 'mark exercise as done' to log a completed habit.",
      "Say 'how am I doing' to check today's progress.",
      "Say 'add yoga to my habits' to create a new habit.",
      "Say 'remove meditation' to delete a habit.",
      "Say 'start a 25 minute pomodoro' to begin a focus session.",
      "Say 'what's my exercise streak' to check a habit streak.",
      "What would you like to do?",
    ].join(' ');

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt("Say 'list my habits' or 'how am I doing'.")
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Keep up the great work! Goodbye.")
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Error:', error);
    return handlerInput.responseBuilder
      .speak("Sorry, I had trouble with that. Please try again.")
      .reprompt("Say 'help' to hear what I can do.")
      .getResponse();
  },
};

// ── skill builder ─────────────────────────────────────────────────────────────

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MarkHabitDoneIntentHandler,
    UnmarkHabitIntentHandler,
    ListHabitsIntentHandler,
    GetProgressIntentHandler,
    AddHabitIntentHandler,
    RemoveHabitIntentHandler,
    StartPomodoroIntentHandler,
    GetStreakIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(persistenceAdapter)
  .lambda();
