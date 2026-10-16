# Epoch 73 | unified-core


---
## EPOCH #73 // 2026-10-16T07:02:00.947Z
### Topik
CEC/IVR/IVA Real-Time Voice Barge-In State Machine with Warm Transfer to Human Agent
### Kod v1
```javascript
```python
import enum

class State(enum.Enum):
    START = 1
    IVA_RESPONSE = 2
    BARGE_IN = 3
    TRANSFER_TO_AGENT = 4

class CECStateMachine:
    def __init__(self):
        self.state = State.START

    def transition(self, event):
        if self.state == State.START:
            self.state = State.IVA_RESPONSE
        elif self.state == State.IVA_RESPONSE:
            if event == 'barge_in':
                self.state = State.BARGE_IN
            elif event == 'transfer':
                self.state = State.TRANSFER_TO_AGENT
        elif self.state == State.BARGE_IN:
            self.state = State.TRANSFER_TO_AGENT
        elif self.state == State.TRANSFER_TO_AGENT:
            # warm transfer to human agent
            pass
```
```
### Kritikan + Sandbox v1
1. Kurangnya pengecualian untuk event yang tidak dikenali.
2. Transisi dari `State.BARGE_IN` ke `State.TRANSFER_TO_AGENT` adalah automatik tanpa sebarang syarat.
3. Tiada pengesahan untuk event `None` atau kosong.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```python
import enum

class State(enum.Enum):
    START = 1
    IVA_RESPONSE = 2
    BARGE_IN = 3
    TRANSFER_TO_AGENT = 4

class CECStateMachine:
    def __init__(self):
        self.state = State.START
        self.transitions = {
            State.START: {'': State.IVA_RESPONSE},
            State.IVA_RESPONSE: {'barge_in': State.BARGE_IN, 'transfer': State.TRANSFER_TO_AGENT},
            State.BARGE_IN: {'': State.TRANSFER_TO_AGENT},
            State.TRANSFER_TO_AGENT: {}
        }

    def transition(self, event):
        if event is None or event == '':
            raise ValueError("Event tidak sah")
        if self.state in self.transitions and event in self.transitions[self.state]:
            self.state = self.transitions[self.state][event]
        else:
            raise ValueError("Peralihan tidak sah")
```
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
1. Tidak salah. 
2. Perlu tambah dokumentasi. 
3. Perlu tambah pengecualian untuk `enum.Enum`. 
4. Selesai.
