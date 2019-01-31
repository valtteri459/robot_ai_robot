module.exports = {
  devServer: {
    proxy: {
      "/": {
        target: 'http://192.168.1.138:8080',
        ws: true
      }
    }
  }
}