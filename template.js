module.exports = function(scope) {
  return {
    package: {
      scripts: {
        "import-seed-data": "node ./scripts/importSeedData.js"
      },
      dependencies: {
        "pg": "^8.3.3",
        "pg-connection-string": "^2.4.0",
        "mime-types": "^2.1.27",
        "strapi-plugin-graphql": scope.strapiVersion,
        "strapi-provider-upload-cloudinary": scope.strapiVersion,
      }
    }
  }
}
