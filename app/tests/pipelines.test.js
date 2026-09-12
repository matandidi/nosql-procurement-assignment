const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const questions = require('../netlify/functions/questions.json');

const mongoDirectory = path.join(__dirname, '../../mongodb');
const context = {};
vm.runInNewContext(readFileSync(path.join(mongoDirectory, 'pipelines.js'), 'utf8'), context);

for (const number of [1, 2, 3]) {
  test(`question ${number} matches in mongosh, Atlas and the web app`, () => {
    const pipeline = JSON.parse(JSON.stringify(context.assignmentPipelines[`question${number}`]));
    const atlasPipeline = JSON.parse(readFileSync(path.join(mongoDirectory, `atlas/question${number}.json`), 'utf8'));
    assert.deepEqual(questions[`q${number}`].pipeline, pipeline);
    assert.deepEqual(atlasPipeline, pipeline);
  });
}
