const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const questions = require('../netlify/functions/questions.json');

// Substitute the database connection so these checks can run without Atlas credentials.
function loadHandler(connect) {
  const context = {
    exports: {},
    process: { env: { MONGODB_URI: 'mongodb://test-only' } },
    require(name) {
      if (name === './questions.json') return questions;
      if (name === 'mongodb') return { MongoClient: class { connect() { return connect(); } } };
      throw new Error(`Unexpected dependency: ${name}`);
    }
  };
  vm.runInNewContext(readFileSync(path.join(__dirname, '../netlify/functions/query.js'), 'utf8'), context);
  return context.exports.handler;
}

test('unknown question IDs are rejected before connecting to the database', async () => {
  let connections = 0;
  const handler = loadHandler(async () => { connections++; throw new Error('Database unavailable'); });
  for (const id of ['q4', 'constructor', 'toString', '__proto__']) {
    const response = await handler({ queryStringParameters: { q: id } });
    assert.equal(response.statusCode, 400, id);
  }
  assert.equal(connections, 0);
});

test('a failed first connection can be retried on the next request', async () => {
  let attempts = 0;
  const client = { db: () => ({ collection: () => ({ countDocuments: async () => 8 }) }) };
  const handler = loadHandler(async () => {
    if (++attempts === 1) throw new Error('Temporary connection failure');
    return client;
  });
  assert.equal((await handler({})).statusCode, 500);
  assert.equal((await handler({})).statusCode, 200);
  assert.equal(attempts, 2);
});

test('research queries reuse the connection and only run the stored pipelines', async () => {
  let connections = 0;
  const calls = [];
  const rows = [{ item_id: 'ITM003', year: 2027, shortage_quantity: 20 }];
  const handler = loadHandler(async () => {
    connections++;
    return { db(name) {
      assert.equal(name, 'nosql_procurement_assignment');
      return { collection(collection) {
        return { aggregate(pipeline) {
          calls.push({ collection, pipeline });
          return { toArray: async () => rows };
        } };
      } };
    } };
  });
  for (const id of ['q1', 'q2', 'q3']) {
    const response = await handler({ queryStringParameters: { q: id, pipeline: '1' } });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(body.rows, rows);
    assert.deepEqual(body.pipeline, questions[id].pipeline);
    assert.equal(body.count, 1);
    assert.equal(calls.at(-1).collection, questions[id].collection);
    assert.deepEqual(calls.at(-1).pipeline, questions[id].pipeline);
  }
  const response = await handler({ queryStringParameters: { q: 'q1', pipeline: '[{"$out":"items"}]' } });
  assert.equal(JSON.parse(response.body).pipeline, undefined);
  assert.equal(connections, 1);
});

test('status returns collection counts and question descriptions without pipelines', async () => {
  const counts = { items: 8, purchase_orders: 8, suppliers: 4 };
  const handler = loadHandler(async () => ({ db: () => ({
    collection: name => ({ countDocuments: async () => counts[name] })
  }) }));
  const body = JSON.parse((await handler({})).body);
  assert.deepEqual(body.counts, counts);
  assert.deepEqual(body.questions.map(question => question.id), ['q1', 'q2', 'q3']);
  assert.ok(body.questions.every(question => !('pipeline' in question)));
});
