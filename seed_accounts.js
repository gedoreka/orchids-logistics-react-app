const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = 'https://xaexoopjqkrzhbochbef.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZXhvb3BqcWtyemhib2NoYmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMyMjEzMywiZXhwIjoyMDgzODk4MTMzfQ.M0oN6jO6gAcKlL-JVqxkRWaclRHIn7ajbCpHgUP5xMk';
const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
    { account_code: '1101', account_name: 'الصندوق', type: 'اصل', company_id: 1 },
    { account_code: '1102', account_name: 'البنك', type: 'اصل', company_id: 1 },
    { account_code: '1201', account_name: 'العملاء', type: 'اصل', company_id: 1 },
    { account_code: '2101', account_name: 'الموردين', type: 'التزام', company_id: 1 },
    { account_code: '3101', account_name: 'رأس المال', type: 'حقوق ملكية', company_id: 1 },
    { account_code: '4101', account_name: 'المبيعات', type: 'ايراد', company_id: 1 },
    { account_code: '4201', account_name: 'إيرادات أخرى', type: 'ايراد', company_id: 1 },
    { account_code: '5101', account_name: 'الرواتب والأجور', type: 'مصروف', company_id: 1 },
    { account_code: '5102', account_name: 'الإيجار', type: 'مصروف', company_id: 1 },
    { account_code: '5103', account_name: 'الكهرباء والمياه', type: 'مصروف', company_id: 1 },
    { account_code: '5104', account_name: 'مصاريف إدارية', type: 'مصروف', company_id: 1 },
];

async function seed() {
    console.log('Starting seed...');
    
    for (const account of accounts) {
        const { data, error } = await supabase
            .from('accounts')
            .upsert(account, { onConflict: 'account_code,company_id' });
        
        if (error) {
            console.error(`Error inserting account ${account.account_code}:`, error);
        } else {
            console.log(`Successfully inserted/updated account ${account.account_code}`);
        }
    }
    
    // Update monthly_expenses to link to 'مصاريف إدارية' (5104)
    const { data: acc } = await supabase
        .from('accounts')
        .select('id')
        .eq('account_code', '5104')
        .eq('company_id', 1)
        .single();
    
    if (acc) {
        const { error: updateError } = await supabase
            .from('monthly_expenses')
            .update({ account_id: acc.id })
            .eq('company_id', 1)
            .is('account_id', null);
        
        if (updateError) {
            console.error('Error updating monthly_expenses:', updateError);
        } else {
            console.log('Successfully updated monthly_expenses');
        }
    }
    
    console.log('Seed completed.');
}

seed();
