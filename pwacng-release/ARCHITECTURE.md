# Kiến trúc dự án PWA MM - MM AI Assistant

## Tổng quan

Dự án này là một Progressive Web App (PWA) được xây dựng trên nền tảng **Magento PWA Studio** với React. Dự án hiện tại tích hợp trợ lý AI "MM AI" như một component floating chatbox trên toàn bộ ứng dụng.

## Cấu trúc thư mục chính

```
pwacng-release/
├── src/
│   ├── @theme/                    # Theme customization
│   │   ├── BaseComponents/        # Custom components
│   │   │   └── AIChatbox/         # ⭐ MM AI Assistant components
│   │   ├── Context/               # Custom React contexts
│   │   ├── Hooks/                 # Custom React hooks
│   │   ├── Talons/                # Business logic hooks
│   │   └── static/                # Static assets (fonts, icons, images)
│   ├── override/                  # Override Magento components
│   │   ├── Components/           # Component overrides
│   │   ├── ContentTypes/         # Page builder content types
│   │   ├── Talons/               # Talon overrides
│   │   └── Store/                # Redux store overrides
│   ├── drivers.js                 # Apollo Client drivers
│   ├── index.js                   # Entry point
│   ├── store.js                   # Redux store configuration
│   └── registerSW.js              # Service Worker registration
├── static/
│   └── manifest.json              # PWA manifest
├── i18n/                          # Internationalization files
│   ├── vi_VN.json
│   └── en_US.json
├── package.json
└── webpack.config.js
```

## MM AI Assistant - Cấu trúc chi tiết

### Vị trí trong ứng dụng

MM AI Assistant được tích hợp vào ứng dụng thông qua component `ActionsSticky`:

**File:** `src/@theme/BaseComponents/ActionsSticky/actionsSticky.js`
- Component này render floating buttons ở góc màn hình
- AIChatbox được import và sử dụng trong component này
- AIChatbox là một Portal component, render ra ngoài DOM tree chính

### Cấu trúc AIChatbox

**Thư mục:** `src/@theme/BaseComponents/AIChatbox/`

#### Components chính:

1. **`aiChatbox.js`** - Component chính
   - Quản lý UI của chatbox (header, sidebar, main content)
   - Xử lý drag & drop cho file/image
   - Quản lý state: fullscreen, history, products sidebar
   - Sử dụng Portal để render ra ngoài DOM tree

2. **`aiChatContent.js`** - Hiển thị nội dung chat
   - Render danh sách messages (user & bot)
   - Xử lý streaming messages từ SSE
   - Parse JSON messages từ AI
   - Hiển thị suggestions, products, cart info
   - Xử lý audio, images, files

3. **`aiChatForm.js`** - Form nhập liệu
   - Text input với auto-resize
   - Upload image/file
   - Voice recording
   - Submit message

4. **`useAIChatbox.js`** - Custom hook (Business Logic)
   - Quản lý session (create, switch, delete)
   - Xử lý SSE streaming với `@microsoft/fetch-event-source`
   - API calls đến AI backend
   - State management cho chat events
   - Xử lý keywords và products real-time updates

5. **`aiChatbotHistory.js`** - Lịch sử chat
   - Hiển thị danh sách sessions
   - Search trong history
   - Switch/delete sessions

6. **`botMessage.js`** - Render bot messages
   - Parse và hiển thị markdown
   - Hiển thị products, cart, order info
   - CTA buttons (checkout, cart, support, etc.)
   - Product galleries

7. **`productGroupKeywords.js`** - Sidebar hiển thị products
   - Hiển thị products theo keywords
   - Product galleries
   - Navigation đến product detail

8. **`aiSession.js`** - Session management utilities
   - Create, get, remove session IDs
   - Lưu trữ trong localStorage

#### Utilities:

- **`imageUploadUtils.js`** - Xử lý upload images
- **`fileUploadUtils.js`** - Xử lý upload files
- **`useProducts.js`** - Hook để fetch products từ GraphQL

### API Integration

**Backend API:** Sử dụng biến môi trường:
- `REACT_APP_AI_SEARCH_URL` - Base URL của AI service
- `REACT_APP_AI_SEARCH_KEY` - API key

**Endpoints chính:**
1. **SSE Streaming:** `${REACT_APP_AI_SEARCH_URL}run_sse`
   - Method: POST
   - Stream real-time responses từ AI
   - Sử dụng `@microsoft/fetch-event-source`

2. **Session Management:**
   - `POST /apps/mmvn_b2c_agent/users/{userId}/sessions/{id}` - Create session
   - `GET /apps/mmvn_b2c_agent/users/{userId}/sessions/{id}` - Get session
   - `PUT /apps/mmvn_b2c_agent/users/{userId}/sessions/{id}` - Update session
   - `DELETE /apps/mmvn_b2c_agent/users/{userId}/sessions/{id}` - Delete session

3. **History:**
   - `POST /apps/mmvn_b2c_agent/session_title` - Get all sessions
   - `POST /apps/mmvn_b2c_agent/users/{userId}/session_search` - Search sessions

### State Management

**Local State (React useState):**
- `chatEvents` - Danh sách messages
- `sessionId` - Current session ID
- `chatbotHistory` - List of sessions
- `processing` - Loading state
- `productKeywords` - Keywords từ AI
- `showProducts` - Products để hiển thị
- `fullscreen` - Fullscreen mode

**Session Storage:**
- `aiBrowserSession` - Current session ID
- `aiChatbot` - Chatbot state (fullscreen, products, etc.)
- `ai_session_ids` - List of session IDs

**Redux Store:**
- Sử dụng Magento Peregrine store cho:
  - User context (`useUserContext`)
  - Cart context (`useCartContext`)
  - App context (`useAppContext`)

### Dependencies chính

**Core:**
- `react` (~17.0.1)
- `react-dom` (~17.0.1)
- `react-router-dom` (~5.2.0)
- `@magento/peregrine` (~14.4.1) - Magento PWA framework
- `@magento/venia-ui` (~11.5.0) - UI components

**AI Chatbox specific:**
- `@microsoft/fetch-event-source` - SSE streaming
- `markdown-it` (13.0.2) - Parse markdown
- `react-speech-recognition` (^4.0.1) - Voice input
- `react-intl` (~5.20.0) - Internationalization

**UI/UX:**
- `react-feather` - Icons
- `sass` (^1.79.4) - Styling
- `informed` (~3.29.0) - Form management

### PWA Features

**Service Worker:**
- File: `src/registerSW.js`
- Đăng ký service worker tại `/sw.js`
- Sử dụng Workbox từ `@magento/pwa-buildpack`

**Manifest:**
- File: `static/manifest.json`
- PWA manifest configuration

**Build:**
- Webpack configuration trong `webpack.config.js`
- Sử dụng `@magento/pwa-buildpack` để build PWA

## Luồng hoạt động của MM AI Assistant

### 1. Khởi tạo
- User click vào button "Trợ lý" (Assistant)
- `handleOpenChat` được gọi
- Tạo hoặc load session từ localStorage
- Gọi API để create/get session
- Mở chatbox UI

### 2. Gửi message
- User nhập text/upload file/image/record voice
- `handleConfirm` được gọi
- Tạo user event và add vào `chatEvents`
- Gọi `sendMessage` với SSE streaming
- Stream responses từ AI và update UI real-time

### 3. Xử lý streaming
- Sử dụng `@microsoft/fetch-event-source` để stream SSE
- Parse từng event từ stream
- Update `chatEvents` với partial messages
- Extract keywords và products từ function calls/responses
- Update sidebar với products real-time

### 4. Hiển thị products
- Khi AI gọi function `search_products_async`
- Extract keywords và products từ response
- Update `productKeywords` và `showProducts` state
- Sidebar hiển thị products
- User có thể click để xem detail

### 5. Session management
- Mỗi session có unique ID (format: `mmvn_{uuid}`)
- Lưu session IDs trong localStorage
- User có thể switch giữa các sessions
- History panel hiển thị tất cả sessions

## Điểm cần lưu ý khi migrate sang React thuần

### 1. Dependencies cần giữ lại
- `@microsoft/fetch-event-source` - SSE streaming
- `markdown-it` - Parse markdown
- `react-speech-recognition` - Voice input
- `react-intl` hoặc `i18next` - i18n

### 2. Dependencies cần thay thế
- `@magento/peregrine` → Remove (chỉ dùng cho Magento)
- `@magento/venia-ui` → Thay bằng UI library khác (Material-UI, Ant Design, etc.)
- `informed` → Có thể giữ hoặc thay bằng `react-hook-form`
- `@apollo/client` → Chỉ cần nếu vẫn dùng GraphQL, nếu không thì remove

### 3. State Management
- Hiện tại: Redux (Magento Peregrine) + React Context
- Có thể: Giữ Redux hoặc chuyển sang Context API / Zustand / Jotai

### 4. Routing
- Hiện tại: `react-router-dom` v5
- Có thể: Upgrade lên v6 hoặc giữ v5

### 5. Styling
- Hiện tại: SCSS modules
- Có thể: Giữ SCSS hoặc chuyển sang CSS-in-JS (styled-components, emotion)

### 6. PWA Features
- Remove Service Worker registration
- Remove PWA manifest (nếu không cần PWA)
- Remove Workbox configuration

### 7. API Integration
- Giữ nguyên API endpoints
- Có thể tách API calls ra service layer riêng
- Sử dụng `fetch` hoặc `axios` thay vì Apollo Client (nếu không dùng GraphQL)

## Cấu trúc đề xuất cho React page mới

```
src/
├── pages/
│   └── MMAssistant/
│       ├── index.jsx              # Main page component
│       ├── components/
│       │   ├── Chatbox/
│       │   │   ├── Chatbox.jsx
│       │   │   ├── Chatbox.scss
│       │   │   ├── ChatHeader.jsx
│       │   │   ├── ChatContent.jsx
│       │   │   ├── ChatForm.jsx
│       │   │   └── ChatHistory.jsx
│       │   ├── Message/
│       │   │   ├── BotMessage.jsx
│       │   │   ├── UserMessage.jsx
│       │   │   └── Message.scss
│       │   └── ProductSidebar/
│       │       ├── ProductSidebar.jsx
│       │       └── ProductGallery.jsx
│       ├── hooks/
│       │   ├── useAIChat.js        # Main hook (từ useAIChatbox.js)
│       │   ├── useSession.js        # Session management
│       │   └── useProducts.js      # Products fetching
│       ├── services/
│       │   ├── aiService.js        # API calls
│       │   └── sessionService.js   # Session API
│       ├── utils/
│       │   ├── imageUpload.js
│       │   ├── fileUpload.js
│       │   └── messageParser.js
│       └── styles/
│           └── assistant.scss
└── ...
```

## Files quan trọng cần migrate

### Core files:
1. `src/@theme/BaseComponents/AIChatbox/aiChatbox.js` → Main page component
2. `src/@theme/BaseComponents/AIChatbox/useAIChatbox.js` → `hooks/useAIChat.js`
3. `src/@theme/BaseComponents/AIChatbox/aiChatContent.js` → `components/Chatbox/ChatContent.jsx`
4. `src/@theme/BaseComponents/AIChatbox/aiChatForm.js` → `components/Chatbox/ChatForm.jsx`
5. `src/@theme/BaseComponents/AIChatbox/botMessage.js` → `components/Message/BotMessage.jsx`
6. `src/@theme/BaseComponents/AIChatbox/aiChatbotHistory.js` → `components/Chatbox/ChatHistory.jsx`
7. `src/@theme/BaseComponents/AIChatbox/productGroupKeywords.js` → `components/ProductSidebar/ProductSidebar.jsx`
8. `src/@theme/BaseComponents/AIChatbox/aiSession.js` → `services/sessionService.js`

### Styles:
- Tất cả `.module.scss` files → Convert sang SCSS modules hoặc CSS-in-JS

### i18n:
- `i18n/vi_VN.json` và `i18n/en_US.json` → Extract keys liên quan đến AI chatbox

## Environment Variables

Cần cấu hình:
- `REACT_APP_AI_SEARCH_URL` - AI service base URL
- `REACT_APP_AI_SEARCH_KEY` - API key

## Notes

1. **Portal Component**: AIChatbox sử dụng Portal để render ra ngoài DOM tree. Có thể giữ hoặc render trực tiếp trong page.

2. **SSE Streaming**: Luồng xử lý SSE khá phức tạp với partial message accumulation. Cần test kỹ khi migrate.

3. **Real-time Updates**: Có sử dụng window events (`aiChatKeywordsUpdate`, `aiChatProductsUpdate`) để update real-time. Có thể thay bằng Context API hoặc state management.

4. **Session Storage**: Nhiều state được lưu trong sessionStorage. Cần đảm bảo tương thích khi migrate.

5. **GraphQL**: Một số components sử dụng GraphQL để fetch products. Nếu không dùng GraphQL, cần thay bằng REST API calls.

6. **Magento Integration**: Một số features tích hợp với Magento (cart, user context). Cần tách ra hoặc thay thế khi migrate.

