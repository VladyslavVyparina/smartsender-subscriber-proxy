# SmartSender subscriber proxy

A few dozen lines of Node that sit on a server, accept the loosely shaped body SmartSender sends, and forward the subscriber id to Thedinator.

## Problem

SmartSender’s “external request” action does not use one fixed field name for the subscriber. The next system needed a stable id and a single URL. Putting that translation inside the automation made every flow brittle.

## What was built

`index.js` is an Express app.

- It accepts JSON and form bodies.
- `pickField` walks a list of possible names and returns the first non-empty value, because the SmartSender body is configured by hand and the key changes.
- It posts the id onward to `THEDINATOR_WEBHOOK_BASE`.
- It refuses to boot if that base URL is missing, so a half-configured process does not silently drop leads.

`env-example.txt` and `package.json` are the whole deployment set. The original notes for uploading the three files over SFTP are folded into this page so the README is in English only.

## How it works

SmartSender calls this process. The handler lifts the subscriber id from whichever field was configured, then calls Thedinator’s webhook with that id. The process listens on `PORT` or 3000.

## Stack

Node.js, Express.

## Run locally

```bash
cp env-example.txt .env
npm install
node index.js
```

Set `THEDINATOR_WEBHOOK_BASE` in `.env` before starting. The process throws on purpose when it is empty.

## What this public copy leaves out

A filled `.env`.
