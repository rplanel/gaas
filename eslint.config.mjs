// @ts-check
import antfu from '@antfu/eslint-config'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default antfu(
  {
    type: 'lib',
    rules: {
      'node/prefer-global/process': 'off',
    },

  },
)
