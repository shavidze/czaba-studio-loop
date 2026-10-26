# Studio Audio Pipeline

CZABA Store-ის Personal Mixdown Studio-ს აუდიო არქიტექტურა და მონაცემთა ნაკადი.

Studio არის Ableton-ის სტილის DAW ბრაუზერში, რომელიც Web Audio API-ს, WaveSurfer.js-ს, IndexedDB ქეშირებას და FFmpeg.wasm-ს იყენებს.

---

## 1. 3-Layer არქიტექტურა

სამი დონის კონტექსტები, თითოეული წინას აფართოებს.

```mermaid
graph TB
    subgraph Layer3["Layer 3: StudioContext — Full DAW"]
        direction TB
        SC_State["StudioState<br/>productId, stems[], isPlaying,<br/>currentTime, masterDuration,<br/>loopRegion, zoomLevel,<br/>video, snap, history"]
        SC_Actions["loadProduct, togglePlayPause,<br/>seek, stop, toggleMute,<br/>toggleSolo, setVolume,<br/>setTrimStart/End, exportAudio,<br/>registerWaveform, setLoopRegion,<br/>selectStem, undo/redo"]
        SC_Route["/studio/$productId"]
    end

    subgraph Layer2["Layer 2: StemsContext — Multi-track Preview"]
        direction TB
        ST_State["StemsPlayerState<br/>currentTrack, stems[],<br/>isPlaying, currentTime,<br/>duration, isLoading"]
        ST_Actions["openStemsPlayer,<br/>togglePlayPause,<br/>toggleMute, toggleSolo,<br/>seek, closeStemsPlayer"]
        ST_Component["StemsPlayerModal"]
    end

    subgraph Layer1["Layer 1: AudioContext — Simple Playback"]
        direction TB
        AC_State["AudioState<br/>currentTrack, isPlaying,<br/>volume, currentTime,<br/>duration, queue[]"]
        AC_Actions["play, pause, resume,<br/>seek, setVolume,<br/>skipNext/Previous,<br/>addToQueue, closePlayer"]
        AC_Component["AudioPlayer"]
    end

    Layer3 -->|"აფართოებს"| Layer2
    Layer2 -->|"აფართოებს"| Layer1

    style Layer3 fill:#1a1a2e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style Layer2 fill:#1a1a2e,stroke:#eab308,stroke-width:2px,color:#fff
    style Layer1 fill:#1a1a2e,stroke:#6366f1,stroke-width:2px,color:#fff
```

---

## 2. Stems Loading Pipeline

პროდუქტის ჩატვირთვის სრული ნაკადი: ავტორიზაციიდან მზადყოფნამდე.

```mermaid
sequenceDiagram
    participant User as მომხმარებელი
    participant Route as studio.$productId
    participant Auth as RequireAuth + RequirePremiumOwnership
    participant TokenAPI as /api/studio-token
    participant Backend as Czaba .NET API
    participant Studio as StudioContext
    participant Cache as IndexedDB Cache
    participant R2 as Cloudflare R2/Worker
    participant WebAudio as Web Audio API

    User->>Route: /studio/:productId გახსნა
    Route->>Auth: ავტორიზაციის შემოწმება
    Auth->>Auth: Premium ლიცენზიის შემოწმება

    alt არ აქვს Premium
        Auth-->>User: "Purchase/Upgrade Required"
    end

    Auth->>TokenAPI: GET /api/studio-token?product=X
    TokenAPI->>Backend: getUserPurchases(accessToken)
    Backend-->>TokenAPI: purchases[]
    TokenAPI->>TokenAPI: HMAC-SHA256 ტოკენის გენერაცია
    TokenAPI-->>Route: { token, expiresIn }

    Route->>Studio: loadProduct(productWithTokens)
    Studio->>Studio: ensureAudioContext()
    Studio->>Studio: clearExpiredCache()

    loop თითოეული Stem-ისთვის
        Studio->>Cache: getCachedStem(productId, stemId)

        alt Cache Hit
            Cache-->>Studio: ArrayBuffer (ქეშიდან)
        else Cache Miss
            Studio->>R2: fetch(stemUrl + ?token=X)
            R2-->>Studio: ArrayBuffer (ქსელიდან)
            Studio->>Cache: cacheStem(productId, stemId, buffer)
        end

        Studio->>WebAudio: ctx.decodeAudioData(arrayBuffer)
        WebAudio-->>Studio: AudioBuffer
        Studio->>Studio: audioBuffersRef.set(stemId, buffer)
        Studio->>Studio: setState: stem.isLoaded = true
    end

    Studio->>Studio: setState: allLoaded = true, masterDuration
    Studio-->>User: Studio მზადაა
```

---

## 3. IndexedDB Caching Layer

360-დღიანი ქეშირების მექანიზმი ქსელის მოთხოვნების ოპტიმიზაციისთვის.

```mermaid
graph LR
    subgraph Browser["ბრაუზერი"]
        App["StudioContext<br/>loadProduct()"]
        IDB["IndexedDB<br/>'czaba-audio-cache'<br/>store: 'stems'"]
    end

    subgraph Network["ქსელი"]
        CF["Cloudflare R2<br/>Worker + Signed URL"]
    end

    App -->|"1. getCachedStem<br/>(productId:stemId)"| IDB

    IDB -->|"2a. Cache HIT<br/>ArrayBuffer"| App
    IDB -->|"2b. Cache MISS<br/>null"| App

    App -->|"3. fetch()<br/>(მხოლოდ MISS-ზე)"| CF
    CF -->|"4. ArrayBuffer"| App

    App -->|"5. cacheStem()<br/>(fire & forget)"| IDB

    subgraph Schema["CachedStem Schema"]
        direction TB
        Key["key: productHandle:stemId"]
        PH["productHandle: string"]
        SID["stemId: string"]
        AB["arrayBuffer: ArrayBuffer"]
        Size["size: number"]
        Time["cachedAt: timestamp"]
    end

    subgraph Expiry["ვადა"]
        direction TB
        Days["360 დღე"]
        Cleanup["clearExpiredCache()<br/>ჩატვირთვისას გაიწმინდება"]
    end

    style IDB fill:#2d2d44,stroke:#14b8a6,color:#fff
    style CF fill:#2d2d44,stroke:#f97316,color:#fff
```

---

## 4. Web Audio API — Mixing Graph

რეალ-ტაიმ დაკვრის აუდიო გრაფი: Source → Gain → Destination.

```mermaid
graph TB
    subgraph AudioCtx["AudioContext (ბრაუზერი)"]
        direction TB

        subgraph Sources["AudioBufferSourceNode-ები (ერთჯერადი)"]
            S1["Source: Drums"]
            S2["Source: Bass"]
            S3["Source: Melody"]
            SN["Source: ...N"]
        end

        subgraph Gains["GainNode-ები (ხმის კონტროლი)"]
            G1["Gain: Drums<br/>volume: 0.8"]
            G2["Gain: Bass<br/>volume: 1.0"]
            G3["Gain: Melody<br/>volume: 0.6"]
            GN["Gain: ...N"]
        end

        Dest["ctx.destination<br/>(Master Output)"]
    end

    subgraph Buffers["AudioBuffer-ები (მეხსიერებაში)"]
        B1["Buffer: Drums<br/>(decoded PCM)"]
        B2["Buffer: Bass"]
        B3["Buffer: Melody"]
        BN["Buffer: ...N"]
    end

    B1 -.->|"source.buffer ="| S1
    B2 -.->|"source.buffer ="| S2
    B3 -.->|"source.buffer ="| S3
    BN -.->|"source.buffer ="| SN

    S1 -->|"connect()"| G1
    S2 -->|"connect()"| G2
    S3 -->|"connect()"| G3
    SN -->|"connect()"| GN

    G1 -->|"connect()"| Dest
    G2 -->|"connect()"| Dest
    G3 -->|"connect()"| Dest
    GN -->|"connect()"| Dest

    style AudioCtx fill:#1a1a2e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style Dest fill:#14b8a6,stroke:#fff,color:#000,stroke-width:2px
```

---

## 5. Solo/Mute ლოგიკა (Ableton-ის სტილი)

Ableton-ის სტანდარტი: Solo პრიორიტეტულია Mute-ზე.

```mermaid
flowchart TD
    Start["shouldStemBeAudible(stem, anySoloed)"]
    CheckMuted{{"stem.isMuted?"}}
    CheckAnySoloed{{"რომელიმე stem Solo-ზეა?"}}
    CheckThisSoloed{{"ეს stem Solo-ზეა?"}}

    Start --> CheckMuted
    CheckMuted -->|"დიახ"| NotAudible["return false<br/>ხმა გამორთულია"]
    CheckMuted -->|"არა"| CheckAnySoloed
    CheckAnySoloed -->|"დიახ"| CheckThisSoloed
    CheckAnySoloed -->|"არა"| Audible["return true<br/>ხმა ჩართულია"]
    CheckThisSoloed -->|"დიახ"| Audible
    CheckThisSoloed -->|"არა"| ImplicitMute["return false<br/>იმპლიციტურად გაჩუმებული"]

    style NotAudible fill:#ef4444,color:#fff
    style Audible fill:#22c55e,color:#fff
    style ImplicitMute fill:#f59e0b,color:#000
```

---

## 6. Playback State Machine

დაკვრის მდგომარეობათა ტრანზიციები.

```mermaid
stateDiagram-v2
    [*] --> Idle: Studio გაიხსნა

    Idle --> Loading: loadProduct()
    Loading --> Ready: allLoaded = true
    Loading --> Error: ჩატვირთვის შეცდომა

    Ready --> Playing: togglePlayPause()
    Playing --> Paused: togglePlayPause()
    Paused --> Playing: togglePlayPause()
    Playing --> Ready: stop() / ბოლომდე მიაღწია
    Paused --> Ready: stop()

    Playing --> Playing: seek() (გადართვა)
    Paused --> Paused: seek() (გადართვა)

    Playing --> LoopRestart: loop end მიაღწია
    LoopRestart --> Playing: restartAudioAtPosition()

    Error --> Loading: Retry (reload)

    note right of Playing
        requestAnimationFrame ციკლი
        WaveSurfer + Video სინქრონიზაცია
        loopRegion-ის შემოწმება
    end note

    note right of Ready
        currentTime = 0
        sourceNodes cleared
        gainNodes cleared
    end note
```

---

## 7. Export Pipeline

ექსპორტის სრული ნაკადი: OfflineAudioContext → WAV (Web Worker) → MP3 (FFmpeg.wasm).

```mermaid
sequenceDiagram
    participant User as მომხმარებელი
    participant Dialog as ExportDialog
    participant Studio as StudioContext
    participant Offline as OfflineAudioContext
    participant Worker as Web Worker<br/>(audio-encoder)
    participant FFmpeg as FFmpeg.wasm

    User->>Dialog: Export ღილაკი
    Dialog->>Dialog: ფორმატი, ხარისხი, stems არჩევა
    Dialog->>Studio: exportAudio(config)

    Studio->>Studio: exportProgress = 0%

    Note over Studio,Offline: Offline Rendering (უფრო სწრაფია ვიდრე რეალ-ტაიმი)

    Studio->>Offline: new OfflineAudioContext(2ch, 48kHz)

    loop თითოეული audible stem
        Studio->>Offline: createBufferSource + createGain
        Studio->>Offline: source.connect(gain).connect(destination)
        Studio->>Offline: source.start(0, trimStart, duration)
    end

    Studio->>Studio: exportProgress = 30%
    Studio->>Offline: startRendering()
    Offline-->>Studio: AudioBuffer (rendered)
    Studio->>Studio: exportProgress = 40%

    Note over Studio,Worker: WAV ენკოდინგი (Web Worker - არ ბლოკავს UI-ს)

    Studio->>Worker: postMessage(channelData, sampleRate, normalize)
    Note over Worker: Float32 → Int16 კონვერტაცია<br/>WAV Header ჩაწერა<br/>ნორმალიზაცია (არჩევით)
    Worker-->>Studio: WAV Blob
    Studio->>Studio: exportProgress = 80%

    alt WAV ფორმატი
        Studio-->>Dialog: WAV Blob
    else MP3 ფორმატი
        Studio->>Studio: exportProgress = 85%
        Studio->>FFmpeg: loadFFmpeg() (lazy, ~31MB CDN-იდან)
        Studio->>FFmpeg: writeFile('input.wav', wavBlob)
        Studio->>FFmpeg: exec(['-i', 'input.wav', '-codec:a', 'libmp3lame', '-b:a', bitrate, 'output.mp3'])
        FFmpeg-->>Studio: MP3 data
        Studio->>Studio: exportProgress = 100%
        Studio-->>Dialog: MP3 Blob
    end

    Dialog->>Dialog: URL.createObjectURL(blob)
    Dialog->>User: ფაილის ჩამოტვირთვა
```

---

## 8. Ableton Live Set (.als) ექსპორტი

სტუდიის პროექტის Ableton Live-ში გადატანის ნაკადი.

```mermaid
graph LR
    subgraph Studio["CZABA Studio"]
        Stems["stems[]: name, volume,<br/>isMuted, isSoloed"]
        Meta["projectName, BPM"]
    end

    subgraph Export["ექსპორტის პროცესი"]
        XML["ALS XML გენერაცია<br/>AudioTrack-ები<br/>Mixer (Volume, Pan, Mute)"]
        Gzip["pako.gzip() კომპრესია"]
        Blob["Blob<br/>(application/x-ableton-liveset)"]
    end

    subgraph Ableton["Ableton Live"]
        ALS[".als ფაილი"]
    end

    Stems --> XML
    Meta --> XML
    XML --> Gzip
    Gzip --> Blob
    Blob -->|"download"| ALS

    style Studio fill:#1a1a2e,stroke:#14b8a6,color:#fff
    style Export fill:#2d2d44,stroke:#eab308,color:#fff
    style Ableton fill:#2d2d44,stroke:#6366f1,color:#fff
```

---

## 9. WaveSurfer ინტეგრაცია

Waveform ვიზუალიზაცია და სინქრონიზაცია StudioContext-თან.

```mermaid
graph TB
    subgraph StudioTrack["StudioTrack კომპონენტი"]
        WRef["waveformRef (div)"]
        Init["WaveSurfer.create()<br/>container, waveColor,<br/>progressColor, barWidth,<br/>height, normalize,<br/>interact: false"]
        Load["wavesurfer.load(stem.audioUrl)"]
        Ready["on('ready') →<br/>registerWaveform(stemId, ws)"]
    end

    subgraph StudioCtx["StudioContext"]
        Registry["waveformInstancesRef<br/>Map&lt;stemId, WaveSurfer&gt;"]
        TimeLoop["requestAnimationFrame<br/>updateTime ციკლი"]
        Sync["waveformInstancesRef.forEach()<br/>wavesurfer.seekTo(progress)"]
        Zoom["setZoomLevel →<br/>wavesurfer.zoom(level * 50)"]
    end

    WRef --> Init
    Init --> Load
    Load --> Ready
    Ready -->|"registerWaveform"| Registry
    TimeLoop --> Sync
    Sync -->|"seekTo(currentTime / duration)"| WRef

    style StudioTrack fill:#1a1a2e,stroke:#14b8a6,color:#fff
    style StudioCtx fill:#2d2d44,stroke:#eab308,color:#fff
```

---

## 10. Error Handling Paths

შეცდომების დამუშავების ადგილები pipeline-ში.

```mermaid
flowchart TD
    subgraph Auth["ავტორიზაციის შეცდომები"]
        A1["RequireAuth: არ არის შესული"]
        A2["RequirePremiumOwnership: არ აქვს ნაყიდი"]
        A3["studio-token API: 401/403"]
    end

    subgraph Loading["ჩატვირთვის შეცდომები"]
        L1["AudioContext შექმნა ვერ მოხერხდა"]
        L2["Stem fetch() ვერ მოხერხდა<br/>(ქსელის შეცდომა)"]
        L3["decodeAudioData() ვერ მოხერხდა<br/>(დაზიანებული ფაილი)"]
        L4["IndexedDB შეცდომა<br/>(ქეში მიუწვდომელია)"]
    end

    subgraph Playback["დაკვრის შეცდომები"]
        P1["audio.play() rejected<br/>(autoplay policy)"]
        P2["AudioContext suspended<br/>(მომხმარებლის ინტერაქცია საჭიროა)"]
    end

    subgraph Export_Err["ექსპორტის შეცდომები"]
        E1["OfflineAudioContext შეცდომა"]
        E2["Web Worker შეცდომა"]
        E3["FFmpeg.wasm ჩატვირთვის შეცდომა<br/>(~31MB CDN-იდან)"]
        E4["FFmpeg კონვერტაციის შეცდომა"]
    end

    A1 -->|"redirect"| LoginPage["Login გვერდი"]
    A2 -->|"UI"| PurchasePage["Purchase/Upgrade UI"]
    A3 -->|"UI"| TokenError["Access Error + Retry ღილაკი"]

    L1 -->|"setState"| LoadFailed["isLoading: false, allLoaded: false"]
    L2 -->|"throw"| LoadFailed
    L3 -->|"throw"| LoadFailed
    L4 -->|"graceful"| FetchFromNetwork["ქსელიდან ჩატვირთვა<br/>(ქეში იგნორირდება)"]

    P1 -->|"catch"| PlayError["console.error + isPlaying: false"]
    P2 -->|"ensureAudioContext()"| Resume["ctx.resume()"]

    E1 -->|"throw"| ExportFailed["isExporting: false, exportProgress: 0"]
    E2 -->|"worker.onerror"| ExportFailed
    E3 -->|"throw"| ExportFailed
    E4 -->|"throw"| ExportFailed

    LoadFailed -->|"UI"| RetryUI["Retry ღილაკი"]
    ExportFailed -->|"alert"| ExportAlert["Export failed alert"]

    style Auth fill:#7f1d1d,stroke:#ef4444,color:#fff
    style Loading fill:#78350f,stroke:#f59e0b,color:#fff
    style Playback fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style Export_Err fill:#4a1d5e,stroke:#a855f7,color:#fff
```

---

## 11. კომპონენტების იერარქია

Studio-ს UI კომპონენტების ხე.

```mermaid
graph TB
    StudioPage["StudioPage<br/>/studio/$productId"]
    ReqAuth["RequireAuth"]
    ReqPremium["RequirePremiumOwnership"]
    Provider["StudioProvider"]
    Content["StudioContent"]

    Header["Sticky Header"]
    PC["PlaybackControls<br/>Play/Pause/Stop"]
    TB["TransportBar<br/>Timeline Ruler + Zoom +<br/>Loop Brace (Ableton)"]

    VideoSection["Video Sync Section"]
    VUZ["VideoUploadZone"]
    VP["VideoPlayer<br/>(PiP, Fullscreen)"]

    SZ["ScrubZone<br/>Drag-to-scrub"]
    GP["GlobalPlayhead<br/>Ableton-style vertical line"]

    Loading["StemsLoadingAnimation<br/>Progress Ring + Track Bars"]
    TrackList["StudioTrackList"]
    Track["StudioTrack (x N)<br/>WaveSurfer + Controls"]
    ExDialog["ExportDialog<br/>Audio + Ableton tabs"]
    DlDialog["DownloadDialog<br/>Signed URLs"]
    KBPanel["KeyboardShortcutsPanel"]

    StudioPage --> ReqAuth --> ReqPremium --> Provider --> Content
    Content --> Header
    Header --> PC
    Header --> TB

    Content --> VideoSection
    VideoSection --> VUZ
    VideoSection --> VP

    Content --> SZ
    Content --> GP
    Content --> Loading
    Content --> TrackList
    TrackList --> Track

    Content --> ExDialog
    Content --> DlDialog
    Content --> KBPanel

    style StudioPage fill:#14b8a6,color:#000,stroke-width:2px
    style Provider fill:#eab308,color:#000,stroke-width:2px
    style Track fill:#6366f1,color:#fff,stroke-width:2px
```

---

## 12. სრული Data Flow

მონაცემთა ნაკადი ბრაუზერიდან ექსპორტამდე.

```mermaid
graph LR
    subgraph External["გარე სერვისები"]
        R2["Cloudflare R2<br/>WAV ფაილები"]
        CFWKR["Cloudflare Worker<br/>Signed URL ვერიფიკაცია"]
        CDN["unpkg CDN<br/>FFmpeg.wasm (~31MB)"]
    end

    subgraph Server["Remix Server"]
        Loader["studio.$productId loader<br/>stems metadata"]
        TokenAPI["api.studio-token<br/>HMAC-SHA256 ტოკენი"]
        ProxyAPI["api.proxy.audio<br/>CORS proxy (dev)"]
    end

    subgraph Client["ბრაუზერი"]
        subgraph Contexts["React Contexts"]
            AC["AudioContext<br/>(Layer 1)"]
            SC["StemsContext<br/>(Layer 2)"]
            StC["StudioContext<br/>(Layer 3)"]
        end

        subgraph WebAPIs["Web APIs"]
            WAC["Web Audio API<br/>AudioContext +<br/>OfflineAudioContext"]
            IDB["IndexedDB<br/>czaba-audio-cache"]
            WS["WaveSurfer.js<br/>Waveform Rendering"]
            WW["Web Worker<br/>WAV Encoding"]
            FFW["FFmpeg.wasm<br/>MP3 Encoding"]
        end

        subgraph UI["UI კომპონენტები"]
            Studio["Studio Page"]
            Tracks["StudioTrack[]"]
            Transport["TransportBar"]
            Export["ExportDialog"]
        end
    end

    R2 --> CFWKR
    CFWKR --> StC
    CDN --> FFW

    Loader --> Studio
    TokenAPI --> StC
    ProxyAPI -.->|"dev only"| StC

    StC --> WAC
    StC --> IDB
    StC --> WS
    StC --> WW
    WW --> FFW

    StC --> Tracks
    StC --> Transport
    StC --> Export

    AC --> UI
    SC --> UI

    style External fill:#1e293b,stroke:#f97316,color:#fff
    style Server fill:#1e293b,stroke:#14b8a6,color:#fff
    style Client fill:#0f172a,stroke:#6366f1,color:#fff
```
