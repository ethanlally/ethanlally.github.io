@echo off
@REM This file is a Windows workaround for Cloudflare Wrangler's Angular detection.
@REM Wrangler forcibly prefixes the build command with NG_DISABLE_VERSION_CHECK=1, which fails on Windows cmd.exe.
@REM This batch file intercepts that specific environment variable and runs the build normally.
@npm run build
