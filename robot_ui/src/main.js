import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
Vue.use(new VueSocketIO({
  debug: false,
  connection: './'
}))
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
