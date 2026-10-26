#!/bin/bash
B=http://127.0.0.1:5199
o=http://127.0.0.1:5173
row(){ echo "=== $*"; curl -s -i --path-as-is "$@" | tr -d '\r' | head -c 1500; echo; }
row $B/api/products
row "$B/api/products?category=sfx"
row "$B/api/products?category=SFX&pageSize=1&page=2"
row "$B/api/products?search=PIANO"
row "$B/api/products?genre=electronic"
row "$B/api/products?isNew=true"
row "$B/api/products?isPremium=true"
row "$B/api/products?pageSize=500"
row "$B/api/products?sortDesc=true&pageSize=3"
row $B/api/products/handle/middle-east
row $B/api/products/handle/nope
row $B/api/products/3
row $B/api/products/99
row $B/api/cart -H "Origin: $o" -H 'X-Session-Id: abc'
row -X POST $B/api/cart/items -H "Origin: $o" -H 'Content-Type: application/json' -d '{}'
row -X PUT $B/api/cart/items/1
row -X DELETE $B/api/cart/items/1
row -X POST $B/api/cart/checkout
row -X POST $B/api/auth/login -d '{}'
row -X POST $B/api/auth/social
row $B/api/auth/profile -H 'Authorization: Bearer fake'
row $B/api/downloads -H 'Authorization: Bearer fake' -H "Origin: $o"
row $B/api/downloads/1/file -H 'Authorization: Bearer fake'
row $B/api/orders -H 'Authorization: Bearer fake'
row -X POST $B/api/payments/intent -H 'Authorization: Bearer fake'
row $B/api/sfx-library -H 'Authorization: Bearer x'
row $B/api/products/1/recordings
row $B/api/products/abc/recordings/2
row $B/api/gift-cards/x
row $B/api/sfx-scenes/1
row $B/api/chat/x
row $B/__mock/health
row -X OPTIONS $B/api/cart -H "Origin: $o" -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: content-type,x-session-id'
row -X OPTIONS $B/api/cart -H "Origin: http://localhost:5173" -H 'Access-Control-Request-Method: GET'
row $B/api/cart -H 'Origin: https://evil.example'
row -X OPTIONS $B/api/cart -H 'Origin: http://127.0.0.1.evil.test:5173'
row $B/hubs/chat/negotiate
row $B/unknown
row "$B/api/../../etc/passwd"
row "$B/api/products/handle/..%2f..%2fetc%2fpasswd"
row "$B/server.mjs"
row "$B/api/downloads/../products/1" -H 'Authorization: Bearer fake'
