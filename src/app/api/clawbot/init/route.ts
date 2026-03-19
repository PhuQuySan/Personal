import { NextResponse } from 'next/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');

        if (secret !== process.env.CLAWBOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const name = body.name || '🤖 Khúc Khích (Clawbot)';
        const avatarUrl = body.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Clawbot&backgroundColor=6366f1';
        const email = body.email || 'agent@clawbot.local';

        const supabase = createAdminClient();

        // Check if user exists
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        let botUser = usersData.users.find((u: any) => u.email === email.toLowerCase());

        if (!botUser) {
            // Create user
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: crypto.randomUUID() + crypto.randomUUID(), // Tiêu chuẩn password cực khoai
                email_confirm: true,
                user_metadata: {
                    name: name
                }
            });

            if (createError) throw createError;
            botUser = createData.user;
            
            // Wait for DB triggers if any
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!botUser) {
            throw new Error("Không thể khởi tạo hoặc tìm thấy User của Bot.");
        }

        // Upsert into profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: botUser.id,
                full_name: name,
                avatar_url: avatarUrl,
                user_role: 'normal'
            });

        if (profileError) {
            console.error('Profile Upsert Error:', profileError);
            throw profileError;
        }

        return NextResponse.json({
            success: true,
            message: 'Đã cập nhật/tạo danh tính cho Bot thành công!',
            botUserId: botUser.id,
            profile: {
                full_name: name,
                avatar_url: avatarUrl
            }
        });

    } catch (error: any) {
        console.error('Init Clawbot API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
