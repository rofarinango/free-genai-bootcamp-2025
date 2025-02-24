# Technical Specifications

## Initialization Step
When the app first initializes it needs to the folowing:
Fetch from the GET localhost:5000/api/groups/:id/raw, this will return a collection of words in a json structure. It will have japanese words with their english translation. We need to store this collection of words in memory.

## Page States

Page states describes the state of the single page application should behavior from a user's perspective.

### Setup State
When a user first's start up the app.
They will only see a button called "Generate Sentence"
When they press the button, the app will generate a sentence using the Sentence Generator LLM, and the state will move to Practice State

### Practice State
When a user is in practice state, they will see an english sentence,
They will also see an upload field under the english sentence
They will see a button called "Submit for Review"
When they press the Submit for Review button and uploaded image will be passed to the Grading System and the app will transition to the Review State

### Review State
When a user is in the review state,
The user will still see the english sentence.
The upload field will be gone.
The user will now see a review of the output from the grading system.

The grading system will return the following information:
    - Transcription of image
    - Translation of image
    - Translation of Transcription
    - Grading
        - a letter score using the S Rank to score
        - a description of whether the attempt was accurate to the english sentence and suggestions.

There will be a button called "Next Question" when clicked
it will generate a new question and place the app into Practice State.

### Sentence Generator LLM Prompt
Generate a simple sentence using the following word: {{word}}
The grammar should be scoped to use JLPTN5 grammar.
You can use the following vocabulary to construct a simple sentence:
- simple objects e.g book, car, ramen, sushi
- simple verbs eg. to meet, to eat, to drink
- simple times eg. tomorrow, today, yesterday

### Grading System
The grading system will do the following:
 - It will transcribe the image using MangaOCR
 - It will use and LLM to produce a literal translation of the transcription
 - It will use another LLM to produce a grade
 - It will then return this data to the frontend app