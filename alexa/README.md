# ADHD Habit Tracker — Alexa Skill

Voice-control your habit tracker hands-free. Say *"Alexa, open Habit Tracker"* to get started.

## What you can say

| Goal | Example utterances |
|---|---|
| Check in | "Alexa, open Habit Tracker" |
| See habits | "List my habits" · "What habits do I have?" |
| Mark done | "Mark exercise as done" · "I finished meditation" |
| Undo | "Unmark exercise" · "I didn't do reading" |
| Progress | "How am I doing?" · "What's my progress today?" |
| Add habit | "Add yoga to my habits" |
| Remove habit | "Remove meditation" |
| Streak | "What's my exercise streak?" |
| Focus timer | "Start a 25 minute pomodoro" · "Start focus mode" |
| Help | "Help" |

## Directory layout

```
alexa/
├── skill-package/
│   ├── skill.json                          # Skill manifest
│   └── interactionModels/custom/en-US.json # Voice interaction model
└── lambda/
    ├── index.js         # Lambda entry point / request handlers
    ├── helpers.js       # Pure data helpers (testable without AWS)
    ├── index.test.js    # Jest unit tests for helpers
    └── package.json     # Node dependencies
```

## Prerequisites

- An [Amazon Developer account](https://developer.amazon.com)
- An AWS account (for Lambda + DynamoDB)
- [ASK CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-intro.html) v2 installed: `npm install -g ask-cli`

## Deploy

### 1. Configure ASK CLI

```bash
ask configure
```

Follow the prompts to link your Amazon Developer and AWS accounts.

### 2. Install Lambda dependencies

```bash
cd alexa/lambda
npm install
```

### 3. Deploy the skill

From the repo root:

```bash
ask deploy --target all
```

ASK CLI reads `skill-package/skill.json` for the manifest and deploys the Lambda function automatically. It also creates the DynamoDB table (`HabitTrackerSkill`) on first run.

### 4. Test in the Alexa developer console

1. Open [developer.amazon.com](https://developer.amazon.com) → Alexa Skills → your skill.
2. Go to **Test** → enable testing.
3. Type or say *"open habit tracker"*.

### 5. Run unit tests

```bash
cd alexa/lambda
npm test
```

## Data model

User data is stored in DynamoDB under the user's Alexa `userId`:

```json
{
  "habits": ["exercise", "meditation", "reading"],
  "completions": {
    "2026-07-31": {
      "exercise": true,
      "meditation": true
    }
  }
}
```

This is independent of the browser's `localStorage`. To sync between the Alexa skill and the web app, expose an API endpoint from the web backend and call it from the Lambda function.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DYNAMODB_TABLE` | `HabitTrackerSkill` | DynamoDB table name |

Set these in the Lambda console or via `ask deploy` skill infrastructure config.
