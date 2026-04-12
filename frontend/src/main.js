import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import { Browser } from '@wailsio/runtime'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.provide('pinia', pinia)

app.use(PrimeVue, {
  theme: {
    preset: definePreset(Aura, {
      semantic: {
        primary: {
          50: '{teal.50}',
          100: '{teal.100}',
          200: '{teal.200}',
          300: '{teal.300}',
          400: '{teal.400}',
          500: '{teal.500}',
          600: '{teal.600}',
          700: '{teal.700}',
          800: '{teal.800}',
          900: '{teal.900}',
          950: '{teal.950}',
        },
      },
    }),
    options: {
      prefix: 'p',
      darkModeSelector: '.darkmode',
      cssLayer: false,
    },
  },
})

app.directive('tooltip', Tooltip)
app.mount('#app')

const clickEvent = (e) => {
  let target = e.target

  while (target !== document.body) {
    if (target.nodeName === 'A') {
      e.preventDefault()
      e.stopPropagation()
      Browser.OpenURL(target.href)
      return
    }
    target = target.parentNode
  }
}

document.body.addEventListener('auxclick', clickEvent)
document.body.addEventListener('click', clickEvent)
