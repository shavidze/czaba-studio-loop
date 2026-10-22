export default {
  root: '/home/runner/czaba-project/tmp/studio-real-loop/b-round-85/probe/site',
  cacheDir: '/home/runner/czaba-project/tmp/studio-real-loop/b-round-85/probe/vitecache',
  resolve: { preserveSymlinks: false },
  server: { host: '127.0.0.1', port: 5191, strictPort: true, fs: { allow: ['/home/runner/czaba-project', '/home/runner/work'] } },
  optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
};
