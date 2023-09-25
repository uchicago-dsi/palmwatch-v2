import {forestData} from './data_by_mill';

export default function getMillData(mill: string) {
  return forestData.find((d) => d['UML ID'] === mill)
}