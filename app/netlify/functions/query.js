// Only the three stored queries are available through this endpoint.
// MONGODB_URI is configured in Netlify with read access to the assignment database.
const { MongoClient } = require('mongodb');
const questions = require('./questions.json');

const DB_NAME = 'nosql_procurement_assignment';
const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*'
};

// Netlify may reuse this function instance across requests.
let clientPromise;

function getClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }
  if (!clientPromise) {
    clientPromise = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 3
    }).connect().catch((error) => {
      // Let the next request reconnect after a temporary connection failure.
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

function reply(statusCode, body) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const action = params.q || 'status';
  const started = Date.now();

  if (action !== 'status' && !Object.hasOwn(questions, action)) {
    return reply(400, { ok: false, error: `unknown question: ${action}` });
  }

  try {
    const client = await getClient();
    const db = client.db(DB_NAME);

    if (action === 'status') {
      const [items, purchaseOrders, suppliers] = await Promise.all([
        db.collection('items').countDocuments(),
        db.collection('purchase_orders').countDocuments(),
        db.collection('suppliers').countDocuments()
      ]);
      return reply(200, {
        ok: true,
        database: DB_NAME,
        counts: { items, purchase_orders: purchaseOrders, suppliers },
        questions: Object.values(questions).map(({ id, collection, title, summary, columns }) => ({ id, collection, title, summary, columns })),
        ms: Date.now() - started
      });
    }

    const question = questions[action];
    const rows = await db.collection(question.collection).aggregate(question.pipeline).toArray();
    return reply(200, {
      ok: true,
      id: question.id,
      collection: question.collection,
      count: rows.length,
      rows,
      pipeline: params.pipeline === '1' ? question.pipeline : undefined,
      ms: Date.now() - started
    });
  } catch (error) {
    return reply(500, { ok: false, error: error.message });
  }
};
