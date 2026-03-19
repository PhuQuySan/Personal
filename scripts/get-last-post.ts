import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    console.log('Fetching latest post...');
    const { data: post, error } = await supabase
        .from('posts')
        .select('title, slug, created_at, user_id, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) throw error;
    console.log('TÊN BÀI VIẾT MỚI NHẤT:', post.title);
    console.log('SLUG:', post.slug);
    console.log('Tác giả:', (post.profiles as unknown as { full_name: string } | null)?.full_name);
}

run().catch(console.error);
