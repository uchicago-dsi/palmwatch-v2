#!/usr/bin/env node
import { readFileSync } from "node:fs";

// read cms_config.json — exported from nav bar search
const config = JSON.parse(
  readFileSync(new URL("./cms_config.json", import.meta.url), "utf8")
);
const sanityToken = "";
const sanityId = ""; // id
const datasetName = "production";

const crudConfig = {
  makeBrands: false,
  makeMills: false,
  makeCountries: false,
  makeSuppliers: false,
  makeGroups: true,
};

const batchSize = 25;

const makeMutations = (elements, type, prop) => {
  return {
    mutations: elements.map((element) => ({
      createOrReplace: {
        _type: type,
        name: element[prop],
        // id: element[prop],
      },
    })),
  };
};

const makeAndDoMutations = async (elements, type, prop) => {
  const mutationCalls = [];
  for (let i = 0; i < elements.length; i += batchSize) {
    mutationCalls.push(
      makeMutations(elements.slice(i, i + batchSize), type, prop)
    );
  }
  for (const mutations of mutationCalls) {
    const res = await fetch(
      `https://${sanityId}.api.sanity.io/v2021-06-07/data/mutate/${datasetName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sanityToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mutations),
      }
    );
    if (!res.ok) {
      throw new Error(`Sanity mutate failed: HTTP ${res.status}`);
    }
  }
};

if (crudConfig.makeBrands) {
  await makeAndDoMutations(config.brands, "brand", "brand");
}

if (crudConfig.makeMills) {
  const mills = config.Mills.map((mill) => ({
    mill: mill.href.replace("/mill/", ""),
  }));
  await makeAndDoMutations(mills, "mill", "mill");
}

if (crudConfig.makeCountries) {
  await makeAndDoMutations(config.Countries, "country", "label");
}

if (crudConfig.makeSuppliers) {
  await makeAndDoMutations(config.Suppliers, "supplier", "label");
}

if (crudConfig.makeGroups) {
  console.log("making groups", config.Groups.length);
  await makeAndDoMutations(config.Groups, "group", "label");
}
