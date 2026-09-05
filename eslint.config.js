import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
  },
  {
    files: ['src/**/*.{js,ts,vue}'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
    },
  },
  {
    rules: {
      'style/eol-last': ['error', 'always'],
      'style/indent': ['error', 2],
      'style/linebreak-style': ['error', 'unix'],
      'style/max-len': [
        'error',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'style/no-trailing-spaces': 'error',
      'unicode-bom': ['error', 'never'],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/max-len': [
        'error',
        {
          code: 100,
          template: 100,
          ignoreHTMLAttributeValues: true,
          ignoreHTMLTextContents: true,
          ignoreUrls: true,
        },
      ],
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['App'],
        },
      ],
    },
  },
)
