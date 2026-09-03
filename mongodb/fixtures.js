function requirement(year, plannedUsage, safetyStock, attritionReserve) {
  return {
    year,
    planned_usage: plannedUsage,
    safety_stock: safetyStock,
    attrition_reserve: attritionReserve,
    total_required: plannedUsage + safetyStock + attritionReserve,
    required_by_date: ISODate(`${year}-06-30T00:00:00.000Z`),
  };
}

function batch(batchId, quantity, expiryDate) {
  return {
    batch_id: batchId,
    quantity,
    expiry_date: ISODate(`${expiryDate}T00:00:00.000Z`),
  };
}

globalThis.assignmentData = {
  suppliers: [
    {
      supplier_id: 'SUP001',
      supplier_name: 'NorthTech Components',
      country: 'Germany',
      lead_time_days: 120,
      performance_status: 'reliable',
    },
    {
      supplier_id: 'SUP002',
      supplier_name: 'BluePeak Industrial',
      country: 'USA',
      lead_time_days: 180,
      performance_status: 'delayed',
    },
    {
      supplier_id: 'SUP003',
      supplier_name: 'Orion Systems Supply',
      country: 'Netherlands',
      lead_time_days: 90,
      performance_status: 'reliable',
    },
    {
      supplier_id: 'SUP004',
      supplier_name: 'DeltaParts Logistics',
      country: 'Italy',
      lead_time_days: 150,
      performance_status: 'watch',
    },
  ],

  items: [
    {
      item_id: 'ITM001',
      manufacturer_part_number: 'TMS-100',
      item_name: 'Thermal Sensor',
      category: 'Sensors',
      shelf_life_months: 60,
      inventory_batches: [
        batch('ITM001-B01', 20, '2026-03-31'),
        batch('ITM001-B02', 30, '2030-12-31'),
        batch('ITM001-B03', 40, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 40, 5, 5),
        requirement(2028, 48, 6, 6),
        requirement(2029, 56, 7, 7),
      ],
    },
    {
      item_id: 'ITM002',
      manufacturer_part_number: 'PRV-210',
      item_name: 'Pressure Valve',
      category: 'Valves',
      shelf_life_months: 96,
      inventory_batches: [
        batch('ITM002-B01', 50, '2030-12-31'),
        batch('ITM002-B02', 60, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 64, 8, 8),
        requirement(2028, 72, 9, 9),
        requirement(2029, 80, 10, 10),
      ],
    },
    {
      item_id: 'ITM003',
      manufacturer_part_number: 'BAT-330',
      item_name: 'Backup Battery',
      category: 'Power',
      shelf_life_months: 48,
      inventory_batches: [
        batch('ITM003-B01', 10, '2026-06-30'),
        batch('ITM003-B02', 20, '2030-12-31'),
        batch('ITM003-B03', 20, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 48, 6, 6),
        requirement(2028, 56, 7, 7),
        requirement(2029, 64, 8, 8),
      ],
    },
    {
      item_id: 'ITM004',
      manufacturer_part_number: 'FLC-440',
      item_name: 'Filter Cartridge',
      category: 'Filters',
      shelf_life_months: 36,
      inventory_batches: [
        batch('ITM004-B01', 25, '2030-12-31'),
        batch('ITM004-B02', 30, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 35, 5, 5),
        requirement(2028, 43, 6, 6),
        requirement(2029, 51, 7, 7),
      ],
    },
    {
      item_id: 'ITM005',
      manufacturer_part_number: 'SLK-550',
      item_name: 'Sealing Kit',
      category: 'Seals',
      shelf_life_months: 60,
      inventory_batches: [
        batch('ITM005-B01', 40, '2030-12-31'),
        batch('ITM005-B02', 50, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 51, 7, 7),
        requirement(2028, 56, 7, 7),
        requirement(2029, 59, 8, 8),
      ],
    },
    {
      item_id: 'ITM006',
      manufacturer_part_number: 'CTL-660',
      item_name: 'Control Module',
      category: 'Electronics',
      shelf_life_months: 120,
      inventory_batches: [
        batch('ITM006-B01', 15, '2030-12-31'),
        batch('ITM006-B02', 20, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 30, 5, 5),
        requirement(2028, 35, 5, 5),
        requirement(2029, 40, 5, 5),
      ],
    },
    {
      item_id: 'ITM007',
      manufacturer_part_number: 'LBP-770',
      item_name: 'Lubrication Pack',
      category: 'Consumables',
      shelf_life_months: 24,
      inventory_batches: [
        batch('ITM007-B01', 15, '2026-12-01'),
        batch('ITM007-B02', 30, '2030-12-31'),
        batch('ITM007-B03', 30, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 40, 5, 5),
        requirement(2028, 52, 7, 6),
        requirement(2029, 64, 8, 8),
      ],
    },
    {
      item_id: 'ITM008',
      manufacturer_part_number: 'OPD-880',
      item_name: 'Optical Detector',
      category: 'Sensors',
      shelf_life_months: 84,
      inventory_batches: [
        batch('ITM008-B01', 20, '2030-12-31'),
        batch('ITM008-B02', 25, '2031-12-31'),
      ],
      annual_requirements: [
        requirement(2027, 27, 4, 4),
        requirement(2028, 43, 6, 6),
        requirement(2029, 48, 6, 6),
      ],
    },
  ],

  purchaseOrders: [
    {
      po_number: 'PO1001',
      supplier_id: 'SUP001',
      order_date: ISODate('2026-09-01T00:00:00.000Z'),
      status: 'open',
      expected_delivery_date: ISODate('2027-05-15T00:00:00.000Z'),
      delay_reason: null,
      lines: [
        { item_id: 'ITM001', required_for_year: 2027, ordered_quantity: 60, delivered_quantity: 0 },
        { item_id: 'ITM002', required_for_year: 2027, ordered_quantity: 30, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1002',
      supplier_id: 'SUP002',
      order_date: ISODate('2026-09-15T00:00:00.000Z'),
      status: 'delayed',
      expected_delivery_date: ISODate('2027-09-30T00:00:00.000Z'),
      delay_reason: 'component_shortage',
      lines: [
        { item_id: 'ITM003', required_for_year: 2027, ordered_quantity: 80, delivered_quantity: 0 },
        { item_id: 'ITM004', required_for_year: 2027, ordered_quantity: 50, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1003',
      supplier_id: 'SUP003',
      order_date: ISODate('2026-10-01T00:00:00.000Z'),
      status: 'partial',
      expected_delivery_date: ISODate('2027-04-30T00:00:00.000Z'),
      delay_reason: null,
      lines: [
        { item_id: 'ITM005', required_for_year: 2027, ordered_quantity: 50, delivered_quantity: 20 },
        { item_id: 'ITM006', required_for_year: 2027, ordered_quantity: 40, delivered_quantity: 10 },
      ],
    },
    {
      po_number: 'PO1004',
      supplier_id: 'SUP004',
      order_date: ISODate('2027-10-01T00:00:00.000Z'),
      status: 'delayed',
      expected_delivery_date: ISODate('2028-08-15T00:00:00.000Z'),
      delay_reason: 'transport_delay',
      lines: [
        { item_id: 'ITM007', required_for_year: 2028, ordered_quantity: 100, delivered_quantity: 0 },
        { item_id: 'ITM008', required_for_year: 2028, ordered_quantity: 70, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1005',
      supplier_id: 'SUP001',
      order_date: ISODate('2027-11-15T00:00:00.000Z'),
      status: 'open',
      expected_delivery_date: ISODate('2028-04-01T00:00:00.000Z'),
      delay_reason: null,
      lines: [
        { item_id: 'ITM001', required_for_year: 2028, ordered_quantity: 50, delivered_quantity: 0 },
        { item_id: 'ITM003', required_for_year: 2028, ordered_quantity: 40, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1006',
      supplier_id: 'SUP002',
      order_date: ISODate('2027-12-01T00:00:00.000Z'),
      status: 'delayed',
      expected_delivery_date: ISODate('2028-10-31T00:00:00.000Z'),
      delay_reason: 'capacity_constraint',
      lines: [
        { item_id: 'ITM002', required_for_year: 2028, ordered_quantity: 60, delivered_quantity: 0 },
        { item_id: 'ITM005', required_for_year: 2028, ordered_quantity: 40, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1007',
      supplier_id: 'SUP003',
      order_date: ISODate('2028-09-01T00:00:00.000Z'),
      status: 'open',
      expected_delivery_date: ISODate('2029-03-15T00:00:00.000Z'),
      delay_reason: null,
      lines: [
        { item_id: 'ITM004', required_for_year: 2029, ordered_quantity: 80, delivered_quantity: 0 },
        { item_id: 'ITM006', required_for_year: 2029, ordered_quantity: 50, delivered_quantity: 0 },
      ],
    },
    {
      po_number: 'PO1008',
      supplier_id: 'SUP004',
      order_date: ISODate('2028-09-15T00:00:00.000Z'),
      status: 'delayed',
      expected_delivery_date: ISODate('2029-09-30T00:00:00.000Z'),
      delay_reason: 'quality_reinspection',
      lines: [
        { item_id: 'ITM007', required_for_year: 2029, ordered_quantity: 60, delivered_quantity: 0 },
        { item_id: 'ITM008', required_for_year: 2029, ordered_quantity: 50, delivered_quantity: 0 },
      ],
    },
  ],
};
