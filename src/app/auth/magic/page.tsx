// 📁 src/app/auth/magic/page.tsx
import { Metadata } from 'next';
import MagicLinkHandler from './MagicLinkHandler';

export const metadata: Metadata = {
    title: 'Đang xác thực...',
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return <MagicLinkHandler />;
}