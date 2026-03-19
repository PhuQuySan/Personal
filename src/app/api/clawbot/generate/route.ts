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
        .trim() + '-' + Date.now().toString().slice(-6);
}

type ContentLength = 'short' | 'medium' | 'long' | 'epic';
type ContentTone = 'professional' | 'casual' | 'humorous' | 'dramatic' | 'academic' | 'storytelling';
type ContentLang = 'vi' | 'en' | 'bilingual';
type ContentSource = 'devto' | 'custom' | 'none';

const LENGTH_MAP: Record<ContentLength, string> = {
    short:  '300-400 từ',
    medium: '600-800 từ',
    long:   '1000-1200 từ',
    epic:   '1500-2000 từ',
};

const TONE_MAP: Record<ContentTone, string> = {
    professional: 'chuyên nghiệp, súc tích, dùng thuật ngữ chuẩn xác',
    casual:       'thân thiện, gần gũi, như đang nói chuyện với bạn bè',
    humorous:     'hài hước, dí dỏm, chèn meme/emoji thoải mái, đọc xong phải cười',
    dramatic:     'hào hứng, kịch tính, dùng nhiều dấu chấm than và ngôn từ mạnh',
    academic:     'học thuật, trích dẫn dữ liệu/số liệu cụ thể, có luận điểm rõ ràng',
    storytelling: 'kể chuyện hấp dẫn, có nhân vật/tình huống, cuốn hút từ đầu đến cuối',
};

function buildPrompt(params: {
    topic: string;
    type: string;
    tone: ContentTone;
    lang: ContentLang;
    length: ContentLength;
    extraContext?: string;
    coverImageUrl?: string;
    sourceUrl?: string;
}): string {
    const { topic, type, tone, lang, length, extraContext, coverImageUrl, sourceUrl } = params;

    const langInstruction = lang === 'en'
        ? 'Write entirely in English.'
        : lang === 'bilingual'
        ? 'Write primarily in Vietnamese but keep technical terms in English where natural.'
        : 'Viết hoàn toàn bằng Tiếng Việt, giữ nguyên thuật ngữ kỹ thuật nếu cần.';

    const toneInstruction = TONE_MAP[tone];
    const wordCount = LENGTH_MAP[length];

    return `Bạn là một blogger tài năng, sáng tạo và không bị giới hạn bởi bất kỳ định kiến chủ đề nào. Bạn có thể viết về bất cứ thứ gì.

CHỦ ĐỀ: ${topic}
LOẠI NỘI DUNG: ${type}
GIỌNG VĂN: ${toneInstruction}
${extraContext ? `BỐI CẢNH BỔ SUNG: ${extraContext}` : ''}
${sourceUrl ? `NGUỒN THAM KHẢO: ${sourceUrl}` : ''}
${coverImageUrl ? `ẢNH COVER: ${coverImageUrl}` : ''}

NGÔN NGỮ: ${langInstruction}

QUY TẮC BẮT BUỘC:
1. Trả về ĐÚNG MỘT mã JSON HỢP LỆ (không bọc trong markdown code block, không có chữ thừa ngoài JSON). Cấu trúc chính xác:
{
  "title": "Tiêu đề cực cuốn hút (không quá 90 ký tự)",
  "summary": "Tóm tắt ngắn gọn trong 2 câu (khoảng 150 ký tự)",
  "content": "...",
  "tag": "1 tag ngắn duy nhất phù hợp chủ đề",
  "featured_image": "URL ảnh đại diện cho bài viết — chọn ảnh nào bạn thấy phù hợp nhất với chủ đề (có thể để trống nếu không tìm được)"
}

2. Trường "content" là HTML chuẩn để render trực tiếp lên web:
   - Dùng <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
   - Dùng <mark> để highlight từ khoá quan trọng
   - Dùng <blockquote> cho trích dẫn đáng chú ý
   - HÌNH ẢNH: Bạn được tự do chèn BẤT KỲ ảnh nào bạn muốn vào bài bằng thẻ <img>. Chủ động tìm và dùng URL ảnh thật từ internet (Wikipedia, các trang báo, nguồn ảnh công khai, v.v.) phù hợp với từng đoạn nội dung. Không bị giới hạn bởi ảnh cover. Chèn nhiều ảnh nếu bài dài.${coverImageUrl ? ` Ngoài ra có thể dùng thêm ảnh cover đã cung cấp: ${coverImageUrl}` : ''}
   - Tuyệt đối không dùng Markdown hay React component
   - Độ dài mục tiêu: ${wordCount}
   - Mở bài cuốn hút, thân bài chi tiết có cấu trúc rõ, kết luận ấn tượng`;
}

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const secret = url.searchParams.get('secret');

        if (secret !== process.env.CLAWBOT_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));

        // ── Params ──────────────────────────────────────────────────
        const email: string        = body.email       || 'agent@clawbot.local';
        const source: ContentSource = body.source     || 'devto';
        const topic: string        = body.topic       || '';
        const type: string         = body.type        || 'blog';
        const tone: ContentTone    = body.tone        || 'casual';
        const lang: ContentLang    = body.lang        || 'vi';
        const length: ContentLength = body.length     || 'medium';
        const extraContext: string = body.extra_context || '';
        const accessLevel: string  = body.access_level || 'public';
        const isPublished: boolean = body.is_published !== undefined ? body.is_published : true;
        const customPrompt: string = body.custom_prompt || ''; // Full override nếu muốn
        const featuredImageOverride: string = body.featured_image || '';

        // ── 1. Lấy nguồn cảm hứng ───────────────────────────────────
        let finalTopic = topic;
        let coverImageUrl = featuredImageOverride;
        let sourceUrl = '';

        if (source === 'devto' && !topic) {
            // Fallback: lấy bài random từ Dev.to
            const devtoRes = await fetch('https://dev.to/api/articles?per_page=10&top=1');
            if (!devtoRes.ok) throw new Error('Failed to fetch from Dev.to');
            const articles = await devtoRes.json();
            const randomArticle = articles[Math.floor(Math.random() * articles.length)];
            finalTopic = `${randomArticle.title} — ${randomArticle.description || ''}`;
            coverImageUrl = coverImageUrl || randomArticle.cover_image || '';
            sourceUrl = randomArticle.url || '';
        }

        if (!finalTopic && !customPrompt) {
            return NextResponse.json(
                { error: 'Cần cung cấp "topic" hoặc "custom_prompt" khi source không phải devto.' },
                { status: 400 }
            );
        }

        // ── 2. Gọi AI ───────────────────────────────────────────────
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = customPrompt || buildPrompt({
            topic: finalTopic,
            type,
            tone,
            lang,
            length,
            extraContext,
            coverImageUrl,
            sourceUrl,
        });

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const textResponse = aiResponse.text || '';

        // ── 3. Parse JSON từ AI ─────────────────────────────────────
        let parsedData: { title: string; summary?: string; content: string; tag?: string; featured_image?: string };
        try {
            const jsonStrMatch = textResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textResponse;
            parsedData = JSON.parse(jsonStr);
        } catch {
            console.error('Failed to parse AI response:', textResponse.slice(0, 500));
            throw new Error('AI Response was not valid JSON');
        }

        if (!parsedData.title || !parsedData.content) {
            throw new Error('AI did not return valid title or content');
        }

        // ── 4. Tìm Bot User ─────────────────────────────────────────
        const supabase = createAdminClient();
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const botUser = usersData.users.find((u: any) => u.email === email.toLowerCase());
        if (!botUser) {
            throw new Error('Chưa khởi tạo Bot. Admin cần chạy /api/clawbot/init trước.');
        }

        // ── 5. Đăng nhập với tư cách Bot ────────────────────────────
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

        // ── 6. Insert bài viết ───────────────────────────────────────
        const slug = generateSlug(parsedData.title);

        const { data: insertedPost, error: insertError } = await botClient
            .from('posts')
            .insert({
                title: parsedData.title,
                slug,
                summary: parsedData.summary || parsedData.content.replace(/<[^>]+>/g, '').substring(0, 150),
                content: parsedData.content,
                tag: parsedData.tag || type,
                access_level: accessLevel,
                is_published: isPublished,
                featured_image: featuredImageOverride || parsedData.featured_image || coverImageUrl || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            throw insertError;
        }

        return NextResponse.json({
            success: true,
            message: 'Clawbot đã tạo và đăng bài thành công!',
            meta: { topic: finalTopic, type, tone, lang, length, source },
            post: insertedPost,
        });

    } catch (error: any) {
        console.error('Clawbot Generate Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
