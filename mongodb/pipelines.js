// Reusable aggregation pipelines for the three research questions.

globalThis.assignmentPipelines = {
  question1: [
    {
      $set: {
        all_requirements: '$annual_requirements'
      }
    },
    {
      $lookup: {
        from: 'purchase_orders',
        let: { lookup_item_id: '$item_id' },
        pipeline: [
          {
            $match: {
              status: { $in: ['open', 'partial', 'delayed'] }
            }
          },
          { $unwind: '$lines' },
          {
            $match: {
              $expr: { $eq: ['$lines.item_id', '$$lookup_item_id'] }
            }
          },
          {
            $project: {
              _id: 0,
              expected_delivery_date: 1,
              outstanding_quantity: {
                $subtract: [
                  '$lines.ordered_quantity',
                  '$lines.delivered_quantity'
                ]
              }
            }
          }
        ],
        as: 'receipts'
      }
    },
    { $unwind: '$annual_requirements' },
    {
      $set: {
        valid_initial_stock: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$inventory_batches',
                  as: 'batch',
                  cond: {
                    $gte: [
                      '$$batch.expiry_date',
                      '$annual_requirements.required_by_date'
                    ]
                  }
                }
              },
              as: 'valid_batch',
              in: '$$valid_batch.quantity'
            }
          }
        },
        cumulative_need: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$all_requirements',
                  as: 'requirement',
                  cond: {
                    $lte: [
                      '$$requirement.year',
                      '$annual_requirements.year'
                    ]
                  }
                }
              },
              as: 'cumulative_requirement',
              in: '$$cumulative_requirement.total_required'
            }
          }
        },
        timely_receipts: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$receipts',
                  as: 'receipt',
                  cond: {
                    $and: [
                      {
                        $lte: [
                          '$$receipt.expected_delivery_date',
                          '$annual_requirements.required_by_date'
                        ]
                      },
                      { $gt: ['$$receipt.outstanding_quantity', 0] }
                    ]
                  }
                }
              },
              as: 'timely_receipt',
              in: '$$timely_receipt.outstanding_quantity'
            }
          }
        }
      }
    },
    {
      $set: {
        projected_balance: {
          $subtract: [
            { $add: ['$valid_initial_stock', '$timely_receipts'] },
            '$cumulative_need'
          ]
        }
      }
    },
    {
      $set: {
        shortage_quantity: {
          $max: [{ $multiply: ['$projected_balance', -1] }, 0]
        }
      }
    },
    { $match: { shortage_quantity: { $gt: 0 } } },
    { $sort: { item_id: 1, 'annual_requirements.year': 1 } },
    {
      $project: {
        _id: 0,
        item_id: 1,
        manufacturer_part_number: 1,
        item_name: 1,
        year: '$annual_requirements.year',
        valid_initial_stock: 1,
        timely_receipts: 1,
        cumulative_need: 1,
        shortage_quantity: 1
      }
    }
  ],

  question2: [
    {
      $match: {
        status: { $in: ['open', 'partial', 'delayed'] }
      }
    },
    { $unwind: '$lines' },
    {
      $set: {
        at_risk_quantity: {
          $subtract: ['$lines.ordered_quantity', '$lines.delivered_quantity']
        }
      }
    },
    { $match: { at_risk_quantity: { $gt: 0 } } },
    {
      $lookup: {
        from: 'items',
        let: {
          lookup_item_id: '$lines.item_id',
          lookup_year: '$lines.required_for_year'
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$item_id', '$$lookup_item_id'] }
            }
          },
          { $unwind: '$annual_requirements' },
          {
            $match: {
              $expr: {
                $eq: ['$annual_requirements.year', '$$lookup_year']
              }
            }
          },
          {
            $project: {
              _id: 0,
              manufacturer_part_number: 1,
              item_name: 1,
              required_by_date: '$annual_requirements.required_by_date'
            }
          }
        ],
        as: 'matched_item'
      }
    },
    { $unwind: '$matched_item' },
    {
      $match: {
        $expr: {
          $gt: ['$expected_delivery_date', '$matched_item.required_by_date']
        }
      }
    },
    { $sort: { po_number: 1, 'lines.item_id': 1 } },
    {
      $project: {
        _id: 0,
        po_number: 1,
        supplier_id: 1,
        item_id: '$lines.item_id',
        manufacturer_part_number: '$matched_item.manufacturer_part_number',
        item_name: '$matched_item.item_name',
        required_for_year: '$lines.required_for_year',
        required_by_date: '$matched_item.required_by_date',
        expected_delivery_date: 1,
        delay_reason: 1,
        at_risk_quantity: 1
      }
    }
  ],

  question3: [
    {
      $match: {
        status: { $in: ['open', 'partial', 'delayed'] }
      }
    },
    { $unwind: '$lines' },
    {
      $set: {
        at_risk_quantity: {
          $subtract: ['$lines.ordered_quantity', '$lines.delivered_quantity']
        }
      }
    },
    { $match: { at_risk_quantity: { $gt: 0 } } },
    {
      $lookup: {
        from: 'items',
        let: {
          lookup_item_id: '$lines.item_id',
          lookup_year: '$lines.required_for_year'
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$item_id', '$$lookup_item_id'] }
            }
          },
          { $unwind: '$annual_requirements' },
          {
            $match: {
              $expr: {
                $eq: ['$annual_requirements.year', '$$lookup_year']
              }
            }
          },
          {
            $project: {
              _id: 0,
              required_by_date: '$annual_requirements.required_by_date'
            }
          }
        ],
        as: 'matched_item'
      }
    },
    { $unwind: '$matched_item' },
    {
      $match: {
        $expr: {
          $gt: ['$expected_delivery_date', '$matched_item.required_by_date']
        }
      }
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'supplier_id',
        foreignField: 'supplier_id',
        as: 'matched_supplier'
      }
    },
    { $unwind: '$matched_supplier' },
    {
      $group: {
        _id: {
          supplier_id: '$supplier_id',
          supplier_name: '$matched_supplier.supplier_name'
        },
        total_delayed_quantity: { $sum: '$at_risk_quantity' },
        delayed_purchase_orders: { $addToSet: '$po_number' },
        delay_reasons: { $addToSet: '$delay_reason' }
      }
    },
    {
      $project: {
        _id: 0,
        supplier_id: '$_id.supplier_id',
        supplier_name: '$_id.supplier_name',
        total_delayed_quantity: 1,
        delayed_purchase_order_count: {
          $size: '$delayed_purchase_orders'
        },
        delayed_purchase_orders: 1,
        delay_reasons: 1
      }
    },
    { $sort: { total_delayed_quantity: -1, supplier_id: 1 } }
  ]
};
