# auth.md

You are an agent. This service supports **agentic registration**: discover → register → (claim if needed) → exchange for an access_token → call API → handle revocation. Follow the steps in order; do not skip ahead.

## Step 1 — Discover

This service uses standard OAuth discovery.

## Step 2 — Pick a method

This service is public. Use the `anonymous` method.

## Step 3 — Register

Registration is not required to access any of the capabilities listed in the API catalog or Agent Skills index. Agents may operate anonymously using the `none` credential type.
