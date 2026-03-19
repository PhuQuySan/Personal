const fs = require('fs');
const path = require('path');

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

// Also fix broken relative imports manually identified
const relativeFixes = [
  // AdminPanelClient using ./PostForm
  { file: 'src/features/dashboard/components/AdminPanelClient.tsx', old: './PostForm', new: '@/features/blog/components/PostForm' },
  // FeaturedImageSelector using ../MediaLibrary
  { file: 'src/features/blog/components/Post/FeaturedImageSelector.tsx', old: '../MediaLibrary', new: '@/features/dashboard/components/MediaLibrary' },
  // ImageWorkspaceClient using ./UploadModal
  { file: 'src/features/dashboard/components/ImageWorkspaceClient.tsx', old: './UploadModal', new: '@/shared/components/UploadModal' },
  // SettingsClient using ./AvatarUploadSimple
  { file: 'src/features/dashboard/components/SettingsClient.tsx', old: './AvatarUploadSimple', new: '@/shared/components/AvatarUploadSimple' }
];

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

const targetDirs = ['src/app', 'src/features', 'src/shared', 'scripts']; // added 'scripts' too!
targetDirs.forEach((dir) => {
  walk(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const [oldPrefix, newPrefix] of Object.entries(prefixMap)) {
      const q1 = "'" + oldPrefix;
      const q2 = '"' + oldPrefix;

      if (content.includes(q1) || content.includes(q2)) {
        content = content.split(q1).join("'" + newPrefix);
        content = content.split(q2).join('"' + newPrefix);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated global imports in ${filePath}`);
    }
  });
});

for (const fix of relativeFixes) {
  if (fs.existsSync(fix.file)) {
    let content = fs.readFileSync(fix.file, 'utf-8');
    let modified = false;
    const q1 = "'" + fix.old + "'";
    const q2 = '"' + fix.old + '"';
    if (content.includes(q1)) {
        content = content.split(q1).join("'" + fix.new + "'");
        modified = true;
    }
    if (content.includes(q2)) {
        content = content.split(q2).join('"' + fix.new + '"');
        modified = true;
    }
    if (modified) {
      fs.writeFileSync(fix.file, content, 'utf-8');
      console.log(`Fixed relative import in ${fix.file}`);
    }
  }
}

