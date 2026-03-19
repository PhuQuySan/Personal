import { NextResponse } from 'next/server';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now().toString().slice(-6); // Ensure uniqueness
}

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');

        if (secret !== process.env.CLAWBOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Dev.to article
        const devtoRes = await fetch('https://dev.to/api/articles?per_page=5&top=1');
        if (!devtoRes.ok) throw new Error('Failed to fetch from Dev.to');
        const articles = await devtoRes.json();
        
        // Pick a random article from top 5
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        
        // 2. Init AI
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Bạn là một chuyên gia công nghệ và một blogger xuất sắc. Hãy viết một bài blog bằng Tiếng Việt cực kỳ hấp dẫn dựa trên bài viết tiếng Anh sau. 
Tiêu đề gốc: "${randomArticle.title}"
Mô tả/Tóm tắt: "${randomArticle.description}"
Ảnh Cover của bài: "${randomArticle.cover_image || ''}"
Đường dẫn tham khảo gốc: ${randomArticle.url}
Tags gốc: ${randomArticle.tag_list.join(', ')}

Quy tắc BẮT BUỘC:
1. Trả về ĐÚNG MỘT mã JSON HỢP LỆ (không bọc trong markdown code block, không có chữ thừa). Cấu trúc chính xác:
{
  "title": "Tiêu đề tiếng Việt siêu cuốn hút (không quá 80 ký tự)",
  "summary": "Tóm tắt ngắn gọn trong 2 câu (khoảng 150 ký tự)",
  "content": "Nội dung bài viết chi tiết, định dạng HTML chuẩn (dùng các thẻ <h2/>, <p/>, <ul/>, <li/>, <strong/>). CHÚ Ý: VIẾT DƯỚI DẠNG MÃ HTML CHUẨN ĐỂ RENDER TRỰC TIẾP LÊN WEB. 
  - [ QUAN TRỌNG ]: BẠN PHẢI HÀNH ĐỘNG NHƯ NGƯỜI THẬT. ĐƯỢC PHÉP VÀ KHUYẾN KHÍCH chèn hình ảnh bằng thẻ <img src='...' alt='...' /> (Sử dụng URL ảnh Cover ở trên để minh họa nếu có).
  - Có thể chèn Video bằng thẻ <iframe> nếu bài viết phù hợp.
  - Sử dụng thẻ <mark> để bôi vàng (highlight) các từ khoá cực kỳ quan trọng.
  - Sử dụng thẻ <blockquote> để căn thụt lề cho trích dẫn hoặc ghi chú đặc biệt.
  - Phân bổ phong phú thẻ <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>.
  Ngoại trừ các thẻ HTML cơ bản, KHÔNG dùng các thẻ React component (như ColorPickerModal). Tuyệt đối không dùng định dạng Markdown cọc cạch. Bài viết dài khoảng 600-800 từ, hành văn lưu loát, chèn emoji mượt mà, có mở bài, thân bài chi tiết và kết luận.",
  "tag": "Chọn ngẫu nhiên 1 tag ngắn duy nhất (Vd: AI, Frontend, Tips, Tech)"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const textResponse = response.text || '';
        
        // Extract JSON using regex logic to safely parse
        let parsedData;
        try {
            const jsonStrMatch = textResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textResponse;
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', textResponse);
            throw new Error('AI Response was not valid JSON');
        }

        if (!parsedData.title || !parsedData.content) {
            throw new Error('AI did not return correct title or content');
        }

        // 3. Find Bot User ID
        const supabase = createAdminClient();
        const email = url.searchParams.get('email') || 'agent@clawbot.local';
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const botUser = usersData.users.find((u: any) => u.email === email.toLowerCase());
        if (!botUser) {
            throw new Error('Chưa khởi tạo Bot. Quản trị viên cần chạy API /init trước.');
        }

        // 4. Authenticate as Bot to avoid DB trigger nullifying user_id
        await supabase.auth.admin.updateUserById(botUser.id, { password: process.env.CLAWBOT_SECRET });
        
        const botClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error: signInError } = await botClient.auth.signInWithPassword({
            email: botUser.email!,
            password: process.env.CLAWBOT_SECRET!
        });
        if (signInError) throw signInError;

        // 5. Insert Post using authenticated botClient
        const slug = generateSlug(parsedData.title);
        
        const { data: insertedPost, error: insertError } = await botClient
            .from('posts')
            .insert({
                title: parsedData.title,
                slug: slug,
                summary: parsedData.summary || parsedData.content.substring(0, 100),
                content: parsedData.content,
                tag: parsedData.tag || 'Tech',
                access_level: 'public',
                is_published: true,
                featured_image: randomArticle.cover_image || null
            })
            .select()
            .single();

        if (insertError) {
            console.error('Database Insert Error:', insertError);
            throw insertError;
        }

        return NextResponse.json({
            success: true,
            message: 'Clawbot đã săn tin, viết bài và đăng thành công!',
            post: insertedPost
        });

    } catch (error: any) {
        console.error('Generate Post API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
