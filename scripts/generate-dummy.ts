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

async function runTest() {
    try {
        console.log('1. Đang săn bài viết hay từ Dev.to...');
        const devtoRes = await fetch('https://dev.to/api/articles?per_page=5&top=1');
        if (!devtoRes.ok) throw new Error('Cổng Dev.to bị lỗi!');
        const articles = await devtoRes.json();
        
        // Pick a random article from top 5
        const randomArticle = articles[Math.floor(Math.random() * articles.length)];
        console.log(`=> Đã chọn bài: "${randomArticle.title}"`);
        
        console.log('2. Mời Gemini AI vào viết bài (Chờ khoảng 5-10 giây)...');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Bạn là một chuyên gia công nghệ và một blogger xuất sắc. Hãy viết một bài blog bằng Tiếng Việt cực kỳ hấp dẫn dựa trên bài viết tiếng Anh sau. 
Tiêu đề gốc: "${randomArticle.title}"
Mô tả/Tóm tắt: "${randomArticle.description}"
Đường dẫn tham khảo: ${randomArticle.url}
Tags gốc: ${randomArticle.tag_list.join(', ')}

Quy tắc BẮT BUỘC:
1. Trả về ĐÚNG MỘT mã JSON HỢP LỆ (không bọc trong markdown code block, không có chữ thừa). Cấu trúc chính xác:
{
  "title": "Tiêu đề tiếng Việt siêu cuốn hút (không quá 80 ký tự)",
  "summary": "Tóm tắt ngắn gọn trong 2 câu (khoảng 150 ký tự)",
  "content": "Nội dung bài viết chi tiết, định dạng HTML chuẩn (dùng các thẻ <h2/>, <p/>, <ul/>, <li/>, <strong/>, <br/>). CHÚ Ý: ĐÂY LÀ MÃ HTML NÊN BẠN KHÔNG ĐƯỢC DÙNG DẤU ** HAY ## NHƯ MARKDOWN TRUYỀN THỐNG MÀ PHẢI DÙNG THẺ HTML NHƯ <strong>, <h2>. Có mở bài, thân bài, chèn emoji mượt mà và kết luận. Khuyến khích chèn link tham khảo gốc ở cuối bài bằng thẻ <a/>. Nội dung khoảng 600 từ.",
  "tag": "Từ 1 đến 2 chữ (Vd: AI, Frontend, Tips, Tech, News)"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const textResponse = response.text || '';
        let parsedData;
        try {
            const jsonStrMatch = textResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textResponse;
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', textResponse);
            throw new Error('AI Response was not valid JSON');
        }

        console.log('=> AI đã viết xong! Tiêu đề mới:', parsedData.title);

        console.log('3. Tìm Identity của Agent SuperIdolm...');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const email = 'testSuperIdol@gmail.com';
        
        // Query directly using Supabase Auth Admin
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const botUser = usersData.users.find(u => u.email === email.toLowerCase());
        if (!botUser) {
            throw new Error('Chưa khởi tạo Bot. Không tìm thấy email: ' + email);
        }

        console.log('4. Authenticating as bot...');
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

        console.log('5. Lưu bài viết vào Database...');
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

        console.log('✅ Hoàn tất! Đã đăng URL bài viết thành công: /blog/' + slug);

    } catch (error) {
        console.error('Lỗi API Generate Post:', error);
    }
}

runTest();
