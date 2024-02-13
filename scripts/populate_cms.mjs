#!/bin/bash/zx
// read cms_config.json
// exported from nav bar search
const config = await JSON.parse(await $`cat scripts/cms_config.json`)
const sanityToken = ''
const sanityId = '' // id
const datasetName = 'production'

const crudConfig = {
  makeBrands: false,
  makeMills: false,
  makeCountries: false,
  makeSuppliers: false,
  makeGroups: true

}

const batchSize = 25

const makeMutations = (elements, type, prop) => {
  return {
    mutations: elements.map((element) => ({
      createOrReplace: {
        _type: type,
        name: element[prop],
        // id: element[prop],
      },
    })),
  }
}

const makeAndDoMutations = async (elements, type, prop) => {
  const mutationCalls = []
  for (let i=0;i<elements.length;i+=batchSize) {
    mutationCalls.push(makeMutations(elements.slice(i, i+batchSize), type, prop))
  }
  // call each mutation
  for (const mutations of mutationCalls) {
    await $`curl 'https://${sanityId}.api.sanity.io/v2021-06-07/data/mutate/${datasetName}' \
    -H 'Authorization: Bearer ${sanityToken}' \
    -H 'Content-Type: application/json' \
    --data-binary ${JSON.stringify(mutations)}`
  }
}

if (crudConfig.makeBrands) {
  await makeAndDoMutations(config.brands, 'brand', 'brand')
}

if (crudConfig.makeMills) {
  const mills = config.Mills.map(mill => ({
    mill: mill.href.replace("/mill/", "")
  }))
  await makeAndDoMutations(mills, 'mill', 'mill')
}

if (crudConfig.makeCountries) {
  await makeAndDoMutations(config.Countries, 'country', 'label')
}

if (crudConfig.makeSuppliers) {
  await makeAndDoMutations(config.Suppliers, 'supplier', 'label')
}

if (crudConfig.makeGroups) {
  console.log('making groups', config.Groups.length)
  await makeAndDoMutations(config.Groups, 'group', 'label')
}