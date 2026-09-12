// Run in mongosh after loading the sample data. See expected-results.md for the output.

(() => {
  load(`${__dirname}/pipelines.js`);
  const researchDb = db.getSiblingDB('nosql_procurement_assignment');

  print('\nשאלת מחקר 1: אילו פריטים צפויים להיות בחוסר, ובאיזו שנה?');
  researchDb.items
    .aggregate(assignmentPipelines.question1)
    .forEach((row) => printjson(row));

  print('\nשאלת מחקר 2: אילו שורות הזמנה צפויות להגיע אחרי מועד הצורך?');
  researchDb.purchase_orders
    .aggregate(assignmentPipelines.question2)
    .forEach((row) => printjson(row));

  print('\nשאלת מחקר 3: אצל אילו ספקים מרוכזת הכמות המאוחרת הגדולה ביותר?');
  researchDb.purchase_orders
    .aggregate(assignmentPipelines.question3)
    .forEach((row) => printjson(row));
})();
