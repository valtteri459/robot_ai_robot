<template>
  <v-container>
    <v-layout
      wrap
    >
      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Vuetify
        </h1>
        <input type="number" v-model.number="channel" placeholder="kanava"/>
        <input type="number" v-model.number="val" placeholder="arvo"/>
        <v-btn color="primary" @click="sendNow()">uh ah</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    message: 'helloWorld',
    channel: 0,
    val: 400
  }),
  methods: {
    /* servo 0
      coin hopper: 530
      camera: 320
      drop: 150
      servo 1
      leftmost: 465
      rightmost: 240 */
    sendNow () {
      this.$socket.emit('servo', { channel: this.channel, val: this.val })
    }
  },
  sockets: {
    connect: () => {
      console.log('socket connected!')
    }
  }
}
</script>

<style>

</style>
