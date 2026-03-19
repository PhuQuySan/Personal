import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    const email = 'testSuperIdol@gmail.com';
    const name = 'SuperIdolm';
    const avatarUrl = 'https://i.guim.co.uk/img/media/68ac07eb2837603511d7d5b3f7b720078ec29fa4/0_125_5100_3060/master/5100.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=e2092f3ab32921401bf78ae1ba0e2fee';

    console.log('Checking auth user...', email);
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    let botUser = usersData.users.find(u => u.email === email);

    if (!botUser) {
        console.log('Creating auth user...');
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: crypto.randomUUID() + crypto.randomUUID(),
            email_confirm: true,
            user_metadata: { name }
        });
        if (error) throw error;
        botUser = data.user;
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('Upserting profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: botUser.id,
            full_name: name,
            avatar_url: avatarUrl,
            user_role: 'normal'
        });

    if (profileError) throw profileError;
    console.log('Done! User ID:', botUser.id);
}

run().catch(console.error);
