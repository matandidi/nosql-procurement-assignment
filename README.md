# מערכת לניהול צורך, מלאי והזמנות של פריטים טכניים מוגבלי חיי מדף

זהו מימוש MongoDB לשאלה 2 בעבודת הסיכום בקורס NoSQL. המערכת מחשבת חוסר צפוי לפי שנה, מאתרת הזמנות שצפויות להגיע אחרי מועד הצורך ומדרגת ספקים לפי הכמות המאוחרת.

כל הנתונים במערכת פיקטיביים. אין במערכת מחירים, עלויות, פרטי רכש אמיתיים או מידע רגיש.

## קובצי ההגשה המרכזיים

- `עבודת סיכום NOSQL - מתן דידי.docx` — העבודה המלאה, הכוללת את שאלה 1 ואת שאלה 2.
- `מצגת שאלה 2 - מתן דידי.pptx` — מצגת ההצגה הנדרשת לשאלה 2, כולל הערות דובר ומקורות.
- `mongodb/` — קוד טעינת הנתונים, הוולידציות ושלוש שאילתות המחקר.
- `diagrams/` — חמשת תרשימי המודלים (01–05) ועמוד סיכום של כולם זה לצד זה (06), נבנים מ-`tools/nosql-assignment/build_diagrams.mjs`.
- `screenshots/` — ראיות הרצה: Data Explorer (01–03), Aggregation Builder של Atlas עם שלוש שאילתות המחקר (07–09) ומסך ה-Cluster (10). הקבצים 04–06 הם תצוגות מעוצבות של הפלט ואינם משולבים עוד במסמך.

## מבנה הקבצים

יש להריץ את הקבצים לפי הסדר הבא:

1. `mongodb/01-create-and-seed.js` — יצירת ה-Collections, הגדרת validators ואינדקסים והכנסת נתוני הדוגמה.
2. `mongodb/03-validation-queries.js` — בדיקת ספירות, שלמות הפניות, תקינות כמויות ושלוש קבוצות תוצאות מדויקות.
3. `mongodb/02-research-queries.js` — הדפסת התוצאות המלאות של שלוש שאלות המחקר.

הקבצים `fixtures.js` ו-`pipelines.js` נטענים אוטומטית על ידי הסקריפטים הראשיים.

## דרישות מוקדמות

- MongoDB Atlas או MongoDB מקומי.
- MongoDB Shell (`mongosh`).
- משתמש בעל הרשאת `readWrite` למסד `nosql_procurement_assignment`.
- בחיבור Atlas: כתובת ה-IP של המחשב המריץ צריכה להופיע ב-IP Access List.

## הפעלה מומלצת — התחברות אחת

יש לפתוח Terminal מתוך תיקיית ההגשה ולהגדיר את פרטי החיבור של סביבת ההרצה. אין לכתוב סיסמה בתוך הקבצים או בתוך ה-URI.

```bash
export MONGODB_URI='mongodb+srv://YOUR_CLUSTER_HOST/'
export MONGODB_USER='YOUR_DATABASE_USER'
mongosh "$MONGODB_URI" --apiVersion 1 --username "$MONGODB_USER"
```

לאחר הזנת הסיסמה ב-prompt של `mongosh`, מריצים:

```javascript
load('mongodb/01-create-and-seed.js')
load('mongodb/03-validation-queries.js')
load('mongodb/02-research-queries.js')
```

## הפעלה כשלוש פקודות נפרדות

אפשר גם להריץ כל קובץ בנפרד. במקרה זה `mongosh` יבקש סיסמה בכל פקודה:

```bash
mongosh "$MONGODB_URI" --apiVersion 1 --username "$MONGODB_USER" mongodb/01-create-and-seed.js
mongosh "$MONGODB_URI" --apiVersion 1 --username "$MONGODB_USER" mongodb/03-validation-queries.js
mongosh "$MONGODB_URI" --apiVersion 1 --username "$MONGODB_USER" mongodb/02-research-queries.js
```

## פלט תקין צפוי

לאחר ההקמה:

```text
SEED COMPLETED
items: 8
suppliers: 4
purchase_orders: 8
```

לאחר האימות:

```text
VALIDATION PASSED
```

תוצאות מלאות והסבר תמציתי מופיעים גם בקובץ `mongodb/expected-results.md`.

## הרצה ללא mongosh — Atlas Aggregation Builder

הנתונים כבר טעונים ב-`Cluster0Test`. כדי להריץ שאילתת מחקר בלי קוד מקומי: Data Explorer → האוסף המתאים (`items` לשאלה 1, `purchase_orders` לשאלות 2–3) → לשונית Aggregations → מצב Text → הדבקת ה-pipeline מתוך `mongodb/pipelines.js` (או מהמסמך) → Run. כך הופקו הצילומים 07–09 ב-3.9.2026.

## תחום האיפוס

סקריפט ההקמה ניתן להרצה חוזרת. הוא מחליף רק את שלושת ה-Collections הבאים בתוך `nosql_procurement_assignment`:

- `items`
- `purchase_orders`
- `suppliers`

הוא אינו מוחק מסדי נתונים אחרים, אינו משנה משתמשים או הרשאות ואינו שומר פרטי התחברות.

## הרצה שאומתה בפועל

ב-1.9.2026 בוצעה הרצה מלאה על MongoDB Atlas עם MongoDB 8.0.29 ו-`mongosh` 2.9.2, והרצה חוזרת מלאה ב-3.9.2026 (MongoDB 8.0.30) — צילום ב-`screenshots/11-mongosh-validation.png`. נוצרו 8 פריטים, 4 ספקים ו-8 הזמנות; בדיקות השלמות ושלוש השוואות התוצאות המדויקות הסתיימו ב-`VALIDATION PASSED`.

ב-3.9.2026 הורצו שלוש שאילתות המחקר פעם נוספת ב-Aggregation Builder של Atlas: 12 תוצאות לשאלה 1, 8 שורות (510 יחידות) לשאלה 2, ו-SUP004 = 280 / SUP002 = 230 לשאלה 3 — זהה לתוצאות המתועדות.
