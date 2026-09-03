// Creates a clean, reproducible MongoDB dataset for the NoSQL final assignment.
// Scope warning: only the three named collections in this assignment database
// are replaced. Credentials and connection details are never stored here.

(() => {
  load(`${__dirname}/fixtures.js`);

  const seedDb = db.getSiblingDB('nosql_procurement_assignment');
  const managedCollections = ['items', 'purchase_orders', 'suppliers'];

  for (const collectionName of managedCollections) {
    if (seedDb.getCollectionNames().includes(collectionName)) {
      seedDb.getCollection(collectionName).drop();
    }
  }

  seedDb.createCollection('items', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'item_id',
          'manufacturer_part_number',
          'item_name',
          'category',
          'shelf_life_months',
          'inventory_batches',
          'annual_requirements'
        ],
        properties: {
          item_id: { bsonType: 'string', minLength: 1 },
          manufacturer_part_number: { bsonType: 'string', minLength: 1 },
          item_name: { bsonType: 'string', minLength: 1 },
          category: { bsonType: 'string', minLength: 1 },
          shelf_life_months: { bsonType: 'int', minimum: 0 },
          inventory_batches: {
            bsonType: 'array',
            minItems: 1,
            items: {
              bsonType: 'object',
              required: ['batch_id', 'quantity', 'expiry_date'],
              properties: {
                batch_id: { bsonType: 'string', minLength: 1 },
                quantity: { bsonType: 'int', minimum: 0 },
                expiry_date: { bsonType: 'date' }
              }
            }
          },
          annual_requirements: {
            bsonType: 'array',
            minItems: 1,
            items: {
              bsonType: 'object',
              required: [
                'year',
                'planned_usage',
                'safety_stock',
                'attrition_reserve',
                'total_required',
                'required_by_date'
              ],
              properties: {
                year: { bsonType: 'int', minimum: 2000 },
                planned_usage: { bsonType: 'int', minimum: 0 },
                safety_stock: { bsonType: 'int', minimum: 0 },
                attrition_reserve: { bsonType: 'int', minimum: 0 },
                total_required: { bsonType: 'int', minimum: 0 },
                required_by_date: { bsonType: 'date' }
              }
            }
          }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  seedDb.createCollection('suppliers', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'supplier_id',
          'supplier_name',
          'country',
          'lead_time_days',
          'performance_status'
        ],
        properties: {
          supplier_id: { bsonType: 'string', minLength: 1 },
          supplier_name: { bsonType: 'string', minLength: 1 },
          country: { bsonType: 'string', minLength: 1 },
          lead_time_days: { bsonType: 'int', minimum: 0 },
          performance_status: {
            bsonType: 'string',
            enum: ['reliable', 'watch', 'delayed']
          }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  seedDb.createCollection('purchase_orders', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'po_number',
          'supplier_id',
          'order_date',
          'status',
          'expected_delivery_date',
          'delay_reason',
          'lines'
        ],
        properties: {
          po_number: { bsonType: 'string', minLength: 1 },
          supplier_id: { bsonType: 'string', minLength: 1 },
          order_date: { bsonType: 'date' },
          status: {
            bsonType: 'string',
            enum: ['open', 'partial', 'delayed', 'completed']
          },
          expected_delivery_date: { bsonType: 'date' },
          delay_reason: { bsonType: ['string', 'null'] },
          lines: {
            bsonType: 'array',
            minItems: 1,
            items: {
              bsonType: 'object',
              required: [
                'item_id',
                'required_for_year',
                'ordered_quantity',
                'delivered_quantity'
              ],
              properties: {
                item_id: { bsonType: 'string', minLength: 1 },
                required_for_year: { bsonType: 'int', minimum: 2000 },
                ordered_quantity: { bsonType: 'int', minimum: 0 },
                delivered_quantity: { bsonType: 'int', minimum: 0 }
              }
            }
          }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  seedDb.items.insertMany(assignmentData.items);
  seedDb.suppliers.insertMany(assignmentData.suppliers);
  seedDb.purchase_orders.insertMany(assignmentData.purchaseOrders);

  seedDb.items.createIndex({ item_id: 1 }, { unique: true, name: 'uq_item_id' });
  seedDb.suppliers.createIndex(
    { supplier_id: 1 },
    { unique: true, name: 'uq_supplier_id' }
  );
  seedDb.purchase_orders.createIndex(
    { po_number: 1 },
    { unique: true, name: 'uq_po_number' }
  );

  print('SEED COMPLETED');
  print(`items: ${seedDb.items.countDocuments({})}`);
  print(`suppliers: ${seedDb.suppliers.countDocuments({})}`);
  print(`purchase_orders: ${seedDb.purchase_orders.countDocuments({})}`);
})();
