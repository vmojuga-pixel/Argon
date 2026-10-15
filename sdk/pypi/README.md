# argon-sdk

Official Python SDK for the Argon AI API platform.

## Install

```bash
pip install argon-sdk
```

## Quick Start

```python
from argon import Argon

argon = Argon(api_key="arg_tn_xxx")
res = argon.chat.send("Hello")
print(res["reply"])
argon.close()
```

## License

MIT
