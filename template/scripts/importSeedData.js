"use strict";
const strapiLib = require('strapi')
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const {
  categories,
  homepage,
  writers,
  articles,
  global
} = require("../data/data.json");
let strapi;


function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = `./data/uploads/${fileName}`;

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  }
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  try {
    const createdEntry = await strapi.query(model).create(entry);
    if (files) {
      await strapi.entityService.uploadFiles(createdEntry, files, {
        model,
      });
    }
  } catch (e) {
    console.log('model', entry, e);
  }
}

async function importCategories() {
  return Promise.all(categories.map((category) => {
    return createEntry({ model: "category", entry: category });
  }));
}

async function importHomepage() {
  const files = {
    "seo.shareImage": getFileData("default-image.png"),
  };
  await createEntry({ model: "homepage", entry: homepage, files });
}

async function importWriters() {
  return Promise.all(writers.map(async (writer) => {
    const files = {
      picture: getFileData(`${writer.email}.jpg`),
    };
    return createEntry({
      model: "writer",
      entry: writer,
      files,
    });
  }));
}

async function importArticles() {
  return Promise.all(articles.map((article) => {
    const files = {
      image: getFileData(`${article.slug}.jpg`),
    };
    return createEntry({ model: "article", entry: article, files });
  }));
}

async function importGlobal() {
  const files = {
    "favicon": getFileData("favicon.png"),
    "defaultSeo.shareImage": getFileData("default-image.png"),
  };
  return createEntry({ model: "global", entry: global, files });
}

async function importSeedData() {
  // Create all entries
  await importCategories();
  await importHomepage();
  await importWriters();
  await importArticles();
  await importGlobal();
}


strapiLib().load().then(
    async (strapiInstance) => {
      try {
        strapi = strapiInstance;
        console.log('Importing seed data...');
        await importSeedData();
        console.log('Successfully imported');
      } catch (error) {
        console.log('Could not import seed data');
        console.error(error);
      }
      strapiInstance.stop(0)
    }
)