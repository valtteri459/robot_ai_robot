module.exports = {
  devServer: {
    proxy: {
      "/socket.io/": {
        target: 'http://192.168.1.138:8080',
        ws: true
      },
      "/api/*": {
        target: 'http://192.168.1.138:8080'
      }
    }
  }
}