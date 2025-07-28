async function main() {
  const result = await Bun.build({
    entrypoints: ['./src/main/server.ts'],
    outdir: './dist',
    minify: process.env.NODE_ENV !== 'local',
    target: 'bun',
    root: '.'
  })

  if (result.success) {
    console.log('Build completed successfully')
  } else {
    console.error('Build failed', result)
    process.exit(1)
  }
}

main()