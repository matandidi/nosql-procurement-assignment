// Clean, presentation-friendly output for research question 2.
console.clear();
load(`${__dirname}/pipelines.js`);

const assignmentDb = db.getSiblingDB('nosql_procurement_assignment');
const rows = assignmentDb.purchase_orders
  .aggregate(globalThis.assignmentPipelines.question2)
  .toArray()
  .map((row) => ({
    po_number: row.po_number,
    item_id: row.item_id,
    required_year: row.required_for_year,
    at_risk_quantity: row.at_risk_quantity,
    delay_reason: row.delay_reason
  }));

print('NOSQL FINAL ASSIGNMENT | RESEARCH QUESTION 2');
print('Purchase-order lines arriving after the required-by date');
console.table(rows);
print(`RESULT: ${rows.length} late purchase-order lines`);

