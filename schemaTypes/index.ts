import {homePageType} from './homePage'
import {listingType} from './listing'
import {simpleBlockContentType} from './objects/simpleBlockContent'
import {pricingSheetType} from './pricingSheet'
import {recentSaleType} from './recentSale'
import {serviceAreaType} from './serviceArea'
import {siteSettingsType} from './siteSettings'

export const schemaTypes = [
  siteSettingsType,
  serviceAreaType,
  pricingSheetType,
  listingType,
  recentSaleType,
  homePageType,
  simpleBlockContentType,
]
