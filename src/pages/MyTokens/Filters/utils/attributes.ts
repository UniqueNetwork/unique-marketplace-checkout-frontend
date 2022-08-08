import { Attribute, AttributeCount, OfferTokenAttribute } from 'api/restApi/offers/types';
import { NFTToken } from 'api/uniqueSdk/types';
import { AttributeType, DecodedAttributes } from '@unique-nft/sdk/tokens';
import { TFilterAttributes } from '../types';

export const sortAttributeCounts = (attributeCountA: AttributeCount, attributeCountB: AttributeCount) => attributeCountA.numberOfAttributes > attributeCountB.numberOfAttributes ? 1 : -1;

export const attributes = (attributeA: Attribute, attributeB: Attribute) => attributeA.key.localeCompare(attributeB.key);

export const toTokenAttributes = (offerAttributes: OfferTokenAttribute[]) => {
  const result: DecodedAttributes = { };
  offerAttributes.map(({ key, value, type }, index) => {
    const convertedValue = Array.isArray(value) ? value.map((v) => ({ _: v })) : { _: value };
    result[index] = {
      isArray: Array.isArray(value),
      isEnum: type === 'Enum',
      value: convertedValue,
      name: { _: key },
      rawValue: convertedValue,
      type: type as AttributeType
    };
    return result;
  });
  return result;
};

export const getAttributesFromTokens = (tokens: NFTToken[]) => {
  // All attributes from available tokens
  const attributesMap: { [key: string]: any[] } = {};
  // ???
  const attributesForFilter: { [key: string]: Array<{ key: string, count: number }>} = {};

  tokens.forEach(({ attributes }) => {
    if (!attributes) { return; }
    // Calculate filters to show
    for (const i in attributes) {
      const { name, value } = attributes[i];
      const attributeName = name._.toLocaleLowerCase();

      if (Array.isArray(value)) {
        attributesMap[attributeName] = [attributesMap[attributeName] ? [...attributesMap[attributeName]] : [], ...value.map((attr) => attr._)];
      }
      if (attributes[i].isEnum) {
        attributesMap[attributeName] = [attributesMap[attributeName] ? [...attributesMap[attributeName]] : [], value._ || value];
      }
    }
    // Calculate counts
    for (const attrName in attributesMap) {
      const counterMap: { [key: string]: number } = {};
      attributesMap[attrName].forEach((attrValue) => {
        if (counterMap[attrValue]) counterMap[attrValue]++;
        else counterMap[attrValue] = 1;
      });
      attributesForFilter[attrName] = [];
      for (const attribute of Object.keys(counterMap)) {
        attributesForFilter[attrName].push({ key: attribute, count: counterMap[attribute] });
      }
    }
  });

  return attributesForFilter;
};

export function countTokenAttributes(attributes: DecodedAttributes | undefined): number {
  let count = 0;
  if (attributes) {
    for (const i in attributes) {
      const value = attributes[i].value;
      if (Array.isArray(value)) {
        count += value.length;
      } else {
        count++;
      }
    }
  }
  return count;
}

export const getAttributesCountFromTokens = (tokens: NFTToken[]) => {
  const countTokensAttributes: number[] = tokens.map(({ attributes }) => countTokenAttributes(attributes));
  // count tokens with the same amount of attributes, result be like { 7: 2, 6: 1 }
  const counterMap: { [key: number]: number } = {};
  countTokensAttributes.forEach((count) => {
    if (counterMap[count]) counterMap[count]++;
    else counterMap[count] = 1;
  });
  // convert to format [{ "numberOfAttributes": 7,"amount": 2 }, { "numberOfAttributes": 6,"amount": 1 }]
  const attributesCountForFilter: AttributeCount[] = [];
  for (const attributesCount in counterMap) {
    attributesCountForFilter.push({ numberOfAttributes: Number(attributesCount), amount: counterMap[attributesCount] });
  }

  return attributesCountForFilter;
};

export function mergeAttributes(tokenAttributes: TFilterAttributes, offerAttributes: TFilterAttributes) {
  const result = { ...tokenAttributes };
  for (const offerAttributeName in offerAttributes) {
    if (result[offerAttributeName]) {
      offerAttributes[offerAttributeName].forEach((offerAttrValue) => {
        let offerAttrValueFound = false;
        result[offerAttributeName].forEach((tokenAttrValue) => {
          if (offerAttrValue.key === tokenAttrValue.key) {
            tokenAttrValue.count += offerAttrValue.count;
            offerAttrValueFound = true;
          }
        });
        if (!offerAttrValueFound) {
          result[offerAttributeName].push(offerAttrValue);
        }
      });
    } else {
      result[offerAttributeName] = offerAttributes[offerAttributeName];
    }
  }
  return result;
}

export function mergeAttributesCount(tokenCountAttributes: AttributeCount[], offerCountAttributes: AttributeCount[]) {
  const result = { ...tokenCountAttributes };
  offerCountAttributes.forEach((offerAttrCount: AttributeCount) => {
    let offerAttrCountFound = false;
    result.forEach((tokenAttrCount) => {
      if (tokenAttrCount.numberOfAttributes === offerAttrCount.numberOfAttributes) {
        tokenAttrCount.amount += offerAttrCount.amount;
        offerAttrCountFound = true;
      }
    });
    if (!offerAttrCountFound) {
      result.push(offerAttrCount);
    }
  });
  return result;
}
