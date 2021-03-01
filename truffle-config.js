module.exports = {
  networks: {
    development: {
      host: "ganache",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "2020",    // Any network (default: none)
    },
  },

  db: {
    enabled: false
  },

  compilers: {
    solc: {
      version: "^0.6.0",    // Fetch exact version from solc-bin (default: truffle's version)
      docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "petersburg"
      }
    }
  }
}
