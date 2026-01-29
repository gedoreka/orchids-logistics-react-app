import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
});

async function setup() {
  try {
    console.log("Checking knowledge_base table...");
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM knowledge_base");
    console.log("Current articles count:", (rows as any)[0].count);

    const defaultData = [
      {
        category: 'general',
        question: 'مرحباً',
        answer: 'أهلاً بك في Logistics Systems Pro! كيف يمكنني مساعدتك اليوم؟ نحن نقدم حلولاً متكاملة للشحن والمحاسبة والموارد البشرية.',
        keywords: JSON.stringify(['مرحبا', 'سلام', 'hi', 'hello', 'اهلا']),
        language: 'ar'
      },
      {
        category: 'general',
        question: 'ما هي خدماتكم؟',
        answer: 'نحن نقدم مجموعة واسعة من الخدمات اللوجستية تشمل: إدارة الشحنات، تتبع الطلبات، إدارة المستودعات، نظام محاسبي متكامل، وإدارة الموارد البشرية (HR).',
        keywords: JSON.stringify(['خدمات', 'ماذا تقدمون', 'services', 'مميزات']),
        language: 'ar'
      },
      {
        category: 'contact',
        question: 'أرقام التواصل',
        answer: 'يمكنكم التواصل معنا عبر الأرقام التالية: \n- الإدارة: 920000000 \n- الدعم الفني: 0500000000 \n- البريد الإلكتروني: support@zoolspeed.com',
        keywords: JSON.stringify(['رقم', 'تواصل', 'اتصال', 'تلفون', 'هاتف', 'contact', 'phone']),
        language: 'ar'
      },
      {
        category: 'technical',
        question: 'كيفية تتبع الشحنة',
        answer: 'يمكنك تتبع شحنتك بالانتقال إلى صفحة "تتبع الشحنات" وإدخال رقم التتبع الخاص بك. سيظهر لك المسار الكامل للشحنة وحالتها الحالية.',
        keywords: JSON.stringify(['تتبع', 'شحنة', 'وين الطلب', 'track', 'shipment']),
        language: 'ar'
      }
    ];

    for (const item of defaultData) {
      await pool.execute(
        "INSERT INTO knowledge_base (category, question, answer, keywords, language) VALUES (?, ?, ?, ?, ?)",
        [item.category, item.question, item.answer, item.keywords, item.language]
      );
    }
    console.log("Default data inserted successfully!");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

setup();
