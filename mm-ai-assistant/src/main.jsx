import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import enUS from 'antd/locale/en_US'
import { IntlProvider } from 'react-intl'
import { SpeechRecognitionProvider } from 'react-speech-recognition'
import App from './App'
import './index.scss'

// Import translations
import viMessages from './i18n/vi.json'
import enMessages from './i18n/en.json'

const messages = {
  vi: viMessages,
  en: enMessages
}

const locale = navigator.language.split('-')[0] || 'vi'
const antdLocale = locale === 'vi' ? viVN : enUS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={antdLocale}>
      <IntlProvider locale={locale} messages={messages[locale] || messages.vi}>
        <SpeechRecognitionProvider>
          <App />
        </SpeechRecognitionProvider>
      </IntlProvider>
    </ConfigProvider>
  </React.StrictMode>,
)

