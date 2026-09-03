# הרצה ב-Atlas Aggregation Builder (ללא mongosh)

הקבצים כאן הם אותם שלושת ה-pipelines מ-`../pipelines.js`, בפורמט JSON מוכן להדבקה.

| קובץ | אוסף | שאלת מחקר |
|---|---|---|
| `question1.json` | `items` | אילו פריטים צפויים להיכנס לחוסר, ובאיזו שנה? |
| `question2.json` | `purchase_orders` | אילו שורות הזמנה צפויות להגיע אחרי מועד הצורך? |
| `question3.json` | `purchase_orders` | אילו ספקים אחראים לכמות המאוחרת הגדולה ביותר? |

צעדים: Atlas → Data Explorer → מסד `nosql_procurement_assignment` → האוסף המתאים → לשונית **Aggregations** → מעבר למצב **Text** → הדבקת תוכן הקובץ → **Run**.

תוצאות צפויות: 12 שורות לשאלה 1; 8 שורות (510 יחידות) לשאלה 2; SUP004 = 280 ו-SUP002 = 230 לשאלה 3.
