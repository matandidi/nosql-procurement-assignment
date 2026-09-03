// Clean, presentation-friendly output for research question 1.
console.clear();
load(`${__dirname}/pipelines.js`);

const assignmentDb = db.getSiblingDB('nosql_procurement_assignment');
const rows = assignmentDb.items
  .aggregate(globalThis.assignmentPipelines.question1)
  .toArray()
  .map((row) => ({
    item_id: row.item_id,
    year: row.year,
    shortage_quantity: row.shortage_quantity
  }));

print('NOSQL FINAL ASSIGNMENT | RESEARCH QUESTION 1');
print('Items with a projected shortage, by year');
console.table(rows);
print(`RESULT: ${rows.length} item-year shortage records`);

