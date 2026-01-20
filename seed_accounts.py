import os
import psycopg2

db_url = "postgresql://postgres.xaexoopjqkrzhbochbef:FQtpzJwraLTrb3gHEX7R2oaAnJPAsyhVntIFiAvsA20kivkFYiKnfpwxQP7iCsiB@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

accounts = [
    ('1101', 'الصندوق', 'اصل', 1),
    ('1102', 'البنك', 'اصل', 1),
    ('1201', 'العملاء', 'اصل', 1),
    ('2101', 'الموردين', 'التزام', 1),
    ('3101', 'رأس المال', 'حقوق ملكية', 1),
    ('4101', 'المبيعات', 'ايراد', 1),
    ('4201', 'إيرادات أخرى', 'ايراد', 1),
    ('5101', 'الرواتب والأجور', 'مصروف', 1),
    ('5102', 'الإيجار', 'مصروف', 1),
    ('5103', 'الكهرباء والمياه', 'مصروف', 1),
    ('5104', 'مصاريف إدارية', 'مصروف', 1),
]

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    for code, name, type, company_id in accounts:
        cur.execute(
            "INSERT INTO accounts (account_code, account_name, type, company_id, created_at) VALUES (%s, %s, %s, %s, NOW()) ON CONFLICT DO NOTHING",
            (code, name, type, company_id)
        )
    
    # Update monthly_expenses to link to 'مصاريف إدارية' (5104)
    cur.execute("""
        UPDATE monthly_expenses 
        SET account_id = (SELECT id FROM accounts WHERE account_code = '5104' AND company_id = 1 LIMIT 1) 
        WHERE company_id = 1 AND account_id IS NULL
    """)
    
    conn.commit()
    print("Successfully seeded accounts and updated monthly_expenses")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
