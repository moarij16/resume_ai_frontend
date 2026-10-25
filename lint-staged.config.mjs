/** Runs on `pre-commit`. ESLint must pass with zero warnings; Prettier formats everything else. */
const config = {
  "*.{ts,tsx,mjs,mts}": ["eslint --fix --max-warnings=0", "prettier --write"],
  "*.{json,md,css,yml,yaml}": "prettier --write",
}

export default config
