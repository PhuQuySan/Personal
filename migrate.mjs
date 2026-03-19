import fs from 'fs';
import path from 'path';

const map = {
  // Folders (Move these first)
  'src/components/Post': 'src/features/blog/components/Post',
  'src/components/QRMethod': 'src/features/auth/components/QRMethod',
  'src/components/checkerror': 'src/shared/components/checkerror',
  'src/components/loading': 'src/shared/components/loading',
  'src/components/motion': 'src/shared/components/motion',
  
  // Components
  'src/components/AdminPanel.tsx': 'src/features/dashboard/components/AdminPanel.tsx',
  'src/components/AdminPanelClient.tsx': 'src/features/dashboard/components/AdminPanelClient.tsx',
  'src/components/AuthProvider.tsx': 'src/features/auth/components/AuthProvider.tsx',
  'src/components/AvatarUploadSimple.tsx': 'src/shared/components/AvatarUploadSimple.tsx',
  'src/components/BlogFilter.tsx': 'src/features/blog/components/BlogFilter.tsx',
  'src/components/DashboardClient.tsx': 'src/features/dashboard/components/DashboardClient.tsx',
  'src/components/GlobalPrefetch.tsx': 'src/shared/components/GlobalPrefetch.tsx',
  'src/components/ImageWorkspaceClient.tsx': 'src/features/dashboard/components/ImageWorkspaceClient.tsx',
  'src/components/LoginForm.tsx': 'src/features/auth/components/LoginForm.tsx',
  'src/components/MediaLibrary.tsx': 'src/features/dashboard/components/MediaLibrary.tsx',
  'src/components/Navigation.tsx': 'src/shared/components/Navigation.tsx',
  'src/components/PostForm.tsx': 'src/features/blog/components/PostForm.tsx',
  'src/components/PostImage.tsx': 'src/features/blog/components/PostImage.tsx',
  'src/components/RelatedPosts.tsx': 'src/features/blog/components/RelatedPosts.tsx',
  'src/components/SettingsClient.tsx': 'src/features/dashboard/components/SettingsClient.tsx',
  'src/components/UploadModal.tsx': 'src/shared/components/UploadModal.tsx',
  'src/components/theme-provider.tsx': 'src/shared/components/theme-provider.tsx',

  // Hooks
  'src/hooks/useCachedData.ts': 'src/shared/hooks/useCachedData.ts',
  'src/hooks/usePrefetch.ts': 'src/shared/hooks/usePrefetch.ts',
  'src/hooks/useQRLogin.ts': 'src/features/auth/hooks/useQRLogin.ts',
  // Lib
  'src/lib/fetchUserProfile.ts': 'src/shared/lib/fetchUserProfile.ts',
  'src/lib/utils.ts': 'src/shared/lib/utils.ts',
  'src/lib/media': 'src/shared/lib/media',
  'src/lib/supabase': 'src/shared/lib/supabase',
  'src/lib/upload': 'src/shared/lib/upload',
  // Contexts
  'src/contexts/NavigationContext.tsx': 'src/shared/contexts/NavigationContext.tsx',
  // Types
  'src/types/index.ts': 'src/shared/types/index.ts'
};

const prefixMap = {
  '@/components/AdminPanel': '@/features/dashboard/components/AdminPanel',
  '@/components/AdminPanelClient': '@/features/dashboard/components/AdminPanelClient',
  '@/components/AuthProvider': '@/features/auth/components/AuthProvider',
  '@/components/AvatarUploadSimple': '@/shared/components/AvatarUploadSimple',
  '@/components/BlogFilter': '@/features/blog/components/BlogFilter',
  '@/components/DashboardClient': '@/features/dashboard/components/DashboardClient',
  '@/components/GlobalPrefetch': '@/shared/components/GlobalPrefetch',
  '@/components/ImageWorkspaceClient': '@/features/dashboard/components/ImageWorkspaceClient',
  '@/components/LoginForm': '@/features/auth/components/LoginForm',
  '@/components/MediaLibrary': '@/features/dashboard/components/MediaLibrary',
  '@/components/Navigation': '@/shared/components/Navigation',
  '@/components/PostForm': '@/features/blog/components/PostForm',
  '@/components/PostImage': '@/features/blog/components/PostImage',
  '@/components/RelatedPosts': '@/features/blog/components/RelatedPosts',
  '@/components/SettingsClient': '@/features/dashboard/components/SettingsClient',
  '@/components/UploadModal': '@/shared/components/UploadModal',
  '@/components/theme-provider': '@/shared/components/theme-provider',
  
  '@/components/Post': '@/features/blog/components/Post',
  '@/components/QRMethod': '@/features/auth/components/QRMethod',
  '@/components/checkerror': '@/shared/components/checkerror',
  '@/components/loading': '@/shared/components/loading',
  '@/components/motion': '@/shared/components/motion',
  
  '@/hooks/useCachedData': '@/shared/hooks/useCachedData',
  '@/hooks/usePrefetch': '@/shared/hooks/usePrefetch',
  '@/hooks/useQRLogin': '@/features/auth/hooks/useQRLogin',
  
  '@/lib/fetchUserProfile': '@/shared/lib/fetchUserProfile',
  '@/lib/utils': '@/shared/lib/utils',
  '@/lib/media': '@/shared/lib/media',
  '@/lib/supabase': '@/shared/lib/supabase',
  '@/lib/upload': '@/shared/lib/upload',

  '@/contexts/NavigationContext': '@/shared/contexts/NavigationContext',

  '@/types': '@/shared/types',
};

// 1. Mkdirs and move files
for (const [src, dest] of Object.entries(map)) {
  if (fs.existsSync(src)) {
    try {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
         fs.cpSync(src, dest, { recursive: true });
         try { fs.rmSync(src, { recursive: true, force: true }); } catch (e) { console.log('EPERM on folder', src); }
      } else {
         fs.copyFileSync(src, dest);
         try { fs.rmSync(src, { force: true }); } catch (e) { console.log('EPERM on file', src); }
      }
      console.log(`Moved ${src} -> ${dest}`);
    } catch (e) {
      console.error(`Failed to move ${src} -> ${dest}:`, e.message);
    }
  }
}

// Function to walk the dir
function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      callback(fullPath);
    }
  }
}

// 2. Rewrite imports
const targetDirs = ['src/app', 'src/features', 'src/shared'];
targetDirs.forEach((dir) => {
  walk(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const [oldPrefix, newPrefix] of Object.entries(prefixMap)) {
      const regex = new RegExp(`(['"])${oldPrefix.replace(/\\/g, '\\\\').replace(/\\//g, '\\/')}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `$1${newPrefix}`);
        modified = true;
      }
    }

    // Handle relative imports from within old structures that are now broken
    // e.g. from src/app/dashboard to ../components/DashboardClient -> now ../../features/dashboard/components/DashboardClient
    // This script assumes absolute imports `@/` were mostly used. If relative ones exist, tsc --noEmit will flag them.

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated imports in ${filePath}`);
    }
  });
});

console.log('Migration script complete.');
