import StyleDictionary from 'style-dictionary'

const sd = new StyleDictionary({
  source: ['tokens/*.tokens.json'],

  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'generated/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
      }],
    },

    ts: {
      transformGroup: 'js',
      buildPath: 'generated/',
      files: [
        { destination: 'tokens.ts',   format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },

    tailwind: {
      transformGroup: 'js',
      buildPath: 'generated/',
      files: [{
        destination: 'tailwind.tokens.cjs',
        format: 'javascript/module-flat',
      }],
    },
  },
})

await sd.buildAllPlatforms()