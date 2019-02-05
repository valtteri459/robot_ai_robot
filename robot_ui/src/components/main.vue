<template>
  <v-container>
    <v-layout
      wrap
    >
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          tiputtimen sijainti
        </h1>
        <v-btn color="primary" v-for="num in [0,1,2,3,4]" :key="num" @click="slot(num)">slotti {{num}}</v-btn>
      </v-flex>
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          moottori status {{powerState}}
        </h1>
        <v-btn color="primary" @click="switchPower()">vaihda</v-btn>
      </v-flex>
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          roottori debug
        </h1>
        <v-btn color="primary" @click="rotor(0)">varasto</v-btn>
        <v-btn color="primary" @click="rotor(1)">kamera</v-btn>
        <v-btn color="primary" @click="rotor(2)">tiputin</v-btn>
      </v-flex>
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          KuvaTest
        </h1>
        <v-btn color="primary" @click="camera()">Ota kuva</v-btn>
        <v-btn color="primary" @click="newCoin()">kuvaa kolikko</v-btn><br/>
        <img :src='imageData' v-if='imageData'/>
      </v-flex>
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          konsoli
        </h1>
        <textarea disabled v-model='consoleData' style="width:100%;min-height:250px"></textarea>
      </v-flex>
      <v-flex xs6>
        <h1 class="display-2 font-weight-bold mb-3">
          Kolikkojen massakuvaus
        </h1>
        <label>ladattu kolikkotyyppi: </label>
        <input type="number" v-model.number="coin"/>
        <v-btn color="primary" @click="setCoin()">Aseta kolikko</v-btn>
        <v-btn color="primary" @click="switchLoop()">{{loop ? 'sammuta' : 'käynnistä'}}</v-btn><br/>
        <img :src='imageData' v-if='imageData'/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    powerState: true,
    imageData: false,
    consoleData: '',
    coin: 0,
    loop: false
  }),
  methods: {
    // 'newPhoto', 'rotor (0,1,2)', 'slot(num, 0,1,2,3,4)
    // 'coinPhoto', 'console'
    // getLoop, setLoop, getCoin, setCoin, coin, loop
    setCoin () {
      this.$socket.emit('setCoin', this.coin)
    },
    switchLoop () {
      this.$socket.emit('setLoop', !this.loop)
    },
    slot (slotNum) {
      this.$socket.emit('slot', slotNum)
    },
    rotor (state) {
      this.$socket.emit('rotor', state)
    },
    camera () {
      this.$socket.emit('newPhoto', 1)
    },
    newCoin () {
      this.$socket.emit('newCoin', 1)
    },
    switchPower () {
      console.log(this.powerState)
      this.$socket.emit('setpower', !this.powerState)
    }
  },
  sockets: {
    connect () {
      console.log('socket connected!')
    },
    power (newState) {
      this.powerState = newState
    },
    console (data) {
      this.consoleData = data + '\n' + this.consoleData
      console.log('FROM SOCKET', data)
    },
    coinPhoto (img) {
      this.imageData = img
    },
    coin (newCoin) {
      this.coin = newCoin
    },
    loop (loopStatus) {
      this.loop = loopStatus
    }
  },
  mounted () {
    this.$socket.emit('getpower', true)
  }
}
</script>

<style>

</style>
