// Clean, presentation-friendly output for research question 3.
console.clear();
load(`${__dirname}/pipelines.js`);

const assignmentDb = db.getSiblingDB('nosql_procurement_assignment');
const rows = assignmentDb.purchase_orders
  .aggregate(globalThis.assignmentPipelines.question3)
  .toArray()
  .map((row) => ({
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
    delayed_quantity: row.total_delayed_quantity,
    delayed_po_count: row.delayed_purchase_order_count,
    delay_reasons: row.delay_reasons.join(', ')
  }));

print('NOSQL FINAL ASSIGNMENT | RESEARCH QUESTION 3');
print('Suppliers ranked by delayed quantity');
console.table(rows);
print(`RESULT: ${rows.length} suppliers with late quantities`);

