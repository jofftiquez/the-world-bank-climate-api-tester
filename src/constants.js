import COUNTRIES from './assets/countries';

export const KINDS = ['country', 'basin'];
export const API_ENDPOINT = 'https://climatedataapi.worldbank.org/climateweb/rest/v1';
export const PARAM_TYPES = [
  'mavg',
  'annualavg',
  'manom',
  'annualanom'
];
export const PARAM_VARS = ['pr', 'tas'];
export const PARAM_PAST = [
  {
    start: 1920,
    end: 1939
  },
  {
    start: 1940,
    end: 1959
  },
  {
    start: 1960,
    end: 1979
  },
  {
    start: 1980,
    end: 1999
  }
];
export const PARAM_FUTURE = [
  {
    start: 2020,
    end: 2039
  },
  {
    start: 2040,
    end: 2059
  },
  {
    start: 2060,
    end: 2079
  },
  {
    start: 2080,
    end: 2099
  }
];
export const PARAM_COUNTRY_ISOS = COUNTRIES.map(country => country.alpha3).filter(iso => !!iso);
export const PARAM_EXTS = ['JSON', 'CSV', 'XML'];