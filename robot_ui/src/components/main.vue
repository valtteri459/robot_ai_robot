<template>
  <v-container>
    <v-layout
      wrap
    >
      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Vuetify
        </h1>
        <v-btn color="primary" @click="$socket.emit('servo', {channel: 0, val: 160})">uh ah</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    message: 'helloWorld'
  }),
  sockets: {
    connect: () => {
      console.log('socket connected!')
    }
  }
}
</script>

<style>

</style>
