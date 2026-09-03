// Validation gate for the NoSQL final assignment.
// Run after connecting with mongosh. The script never stores credentials.

var validationDb = db.getSiblingDB('nosql_procurement_assignment');

function assertEqual(expected, actual, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

assertEqual(8, validationDb.items.countDocuments({}), 'items count');
assertEqual(4, validationDb.suppliers.countDocuments({}), 'suppliers count');
assertEqual(8, validationDb.purchase_orders.countDocuments({}), 'purchase orders count');

function assertNoRows(label, collection, pipeline) {
  const rows = collection.aggregate(pipeline).toArray();
  assertEqual(0, rows.length, `${label}: ${JSON.stringify(rows)}`);
}

assertNoRows(
  'every purchase-order line references an existing item',
  validationDb.purchase_orders,
  [
    { $unwind: '$lines' },
    {
      $lookup: {
        from: 'items',
        localField: 'lines.item_id',
        foreignField: 'item_id',
        as: 'matched_items'
      }
    },
    { $match: { matched_items: { $size: 0 } } },
    { $project: { _id: 0, po_number: 1, item_id: '$lines.item_id' } }
  ]
);

assertNoRows(
  'every purchase order references an existing supplier',
  validationDb.purchase_orders,
  [
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier_id',
        foreignField: 'supplier_id',
        as: 'matched_suppliers'
      }
    },
    { $match: { matched_suppliers: { $size: 0 } } },
    { $project: { _id: 0, po_number: 1, supplier_id: 1 } }
  ]
);

assertNoRows(
  'delivered quantity never exceeds ordered quantity',
  validationDb.purchase_orders,
  [
    { $unwind: '$lines' },
    {
      $match: {
        $expr: {
          $gt: ['$lines.delivered_quantity', '$lines.ordered_quantity']
        }
      }
    },
    {
      $project: {
        _id: 0,
        po_number: 1,
        item_id: '$lines.item_id',
        ordered_quantity: '$lines.ordered_quantity',
        delivered_quantity: '$lines.delivered_quantity'
      }
    }
  ]
);

assertNoRows(
  'annual total equals planned usage plus safety stock plus attrition reserve',
  validationDb.items,
  [
    { $unwind: '$annual_requirements' },
    {
      $match: {
        $expr: {
          $ne: [
            '$annual_requirements.total_required',
            {
              $add: [
                '$annual_requirements.planned_usage',
                '$annual_requirements.safety_stock',
                '$annual_requirements.attrition_reserve'
              ]
            }
          ]
        }
      }
    },
    {
      $project: {
        _id: 0,
        item_id: 1,
        year: '$annual_requirements.year',
        total_required: '$annual_requirements.total_required'
      }
    }
  ]
);

load(`${__dirname}/pipelines.js`);

var expectedQuestion1 = [
  ['ITM002', 2028, 30],
  ['ITM002', 2029, 70],
  ['ITM003', 2027, 20],
  ['ITM003', 2029, 50],
  ['ITM005', 2028, 15],
  ['ITM005', 2029, 50],
  ['ITM006', 2028, 20],
  ['ITM006', 2029, 20],
  ['ITM007', 2028, 55],
  ['ITM007', 2029, 35],
  ['ITM008', 2028, 45],
  ['ITM008', 2029, 35]
];

var actualQuestion1 = validationDb.items
  .aggregate(assignmentPipelines.question1)
  .toArray()
  .map((row) => [row.item_id, row.year, row.shortage_quantity]);

assertEqual(
  JSON.stringify(expectedQuestion1),
  JSON.stringify(actualQuestion1),
  'question 1 exact tuples'
);

var expectedQuestion2 = [
  ['PO1002', 'ITM003', 80],
  ['PO1002', 'ITM004', 50],
  ['PO1004', 'ITM007', 100],
  ['PO1004', 'ITM008', 70],
  ['PO1006', 'ITM002', 60],
  ['PO1006', 'ITM005', 40],
  ['PO1008', 'ITM007', 60],
  ['PO1008', 'ITM008', 50]
];

var actualQuestion2 = validationDb.purchase_orders
  .aggregate(assignmentPipelines.question2)
  .toArray()
  .map((row) => [row.po_number, row.item_id, row.at_risk_quantity]);

assertEqual(
  JSON.stringify(expectedQuestion2),
  JSON.stringify(actualQuestion2),
  'question 2 exact tuples'
);

var expectedQuestion3 = [
  ['SUP004', 'DeltaParts Logistics', 280, 2],
  ['SUP002', 'BluePeak Industrial', 230, 2]
];

var actualQuestion3 = validationDb.purchase_orders
  .aggregate(assignmentPipelines.question3)
  .toArray()
  .map((row) => [
    row.supplier_id,
    row.supplier_name,
    row.total_delayed_quantity,
    row.delayed_purchase_order_count
  ]);

assertEqual(
  JSON.stringify(expectedQuestion3),
  JSON.stringify(actualQuestion3),
  'question 3 exact tuples'
);

print('VALIDATION PASSED');
