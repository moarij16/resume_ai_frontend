/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Scopes are optional; when present they must be one of these.
    "scope-enum": [
      2,
      "always",
      [
        "auth",
        "bff",
        "resumes",
        "jobs",
        "ats",
        "documents",
        "dashboard",
        "profile",
        "ui",
        "layout",
        "api",
        "deps",
        "ci",
        "docs",
        "adr",
        "release",
      ],
    ],
    "body-max-line-length": [2, "always", 100],
  },
}

export default config
