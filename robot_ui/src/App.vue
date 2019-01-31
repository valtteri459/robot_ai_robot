<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Kolikkorobotti</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <mainComponent/>
    </v-content>
  </v-app>
</template>

<script>
import mainComponent from './components/main'

export default {
  name: 'App',
  components: {
    mainComponent
  },
  data () {
    return {
      //
    }
  }
}
</script>
