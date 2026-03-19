import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let botUser = usersData.users.find(u => u.email === 'testsuperidol@gmail.com');

    const { error } = await supabase.from('posts').insert({
        title: 'test', 
        slug: 'test-123', 
        content: 'test', 
        access_level: 'public', 
        is_published: true,
        user_id: botUser?.id
    });

    if (error) {
        console.log("DB ERROR:", JSON.stringify(error, null, 2));
    } else {
        console.log("SUCCESS!");
    }
}
run();
