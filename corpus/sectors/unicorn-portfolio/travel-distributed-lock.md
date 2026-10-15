# Travel Distributed Lock
## Problem
Double-booking bila 1000 user serentak.
## Solution
SET NX PX + Lua release + retry.
## Real Source
Redlock, Booking.com concurrency.
## Metrics
0 race, 5k/min
