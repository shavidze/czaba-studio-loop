# C round 47: დანართი (`c-round-47.md`-ის Edit permission-მა უარყო, ამიტომ ეს ცალკე ფაილშია)

## R47-2: red-ის მიზეზი
- (a1)/(a3)-ს vitest ერთ შეცდომად აჯგუფებს:
  - Expected: `Failed to write metadata: Audio data is empty, cannot tag`
  - Received: `Failed to write metadata: WAV file is missing data chunk`
- (a2): `failed[0].error` არის `"WAV file is missing data chunk"`, მოსალოდნელი `"Audio data is empty, cannot tag"`-ის ნაცვლად.
- red გამოწვეულია შეტყობინების შეუსაბამობით, არა setup/fixture error-ით.

## C-ის ფაზის ბოლოს tree-ის შემოწმება
- `git status --porcelain --untracked-files=all` და `git diff --stat 1ea34df` ფაზის ბოლოს იგივე 4 path-ს აჩვენებს, რაც დასაწყისში.
- `sha256sum -c tree-hash.txt`: 4/4 OK.
- C-ის ფაზაში source არ შეცვლილა.
