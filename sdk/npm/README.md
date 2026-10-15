# @argon/sdk

Official TypeScript SDK for the Argon AI API platform.

## Install

```bash
npm install @argon/sdk
```

## Quick Start

```ts
import { Argon } from '@argon/sdk';

const argon = new Argon({ apiKey: process.env.ARGON_API_KEY! });

const res = await argon.chat.send({ message: "Hello" });
console.log(res.reply);

const project = await argon.omni.execute({
  targetRepo: "your-org/my-app",
  directive: "Build a CRM with transaction tracking",
});
console.log("Live:", project.deployment.liveUrl);
```

## Get API Key

Sign up at https://argon.vmojuga.workers.dev/signup

## License

MIT
