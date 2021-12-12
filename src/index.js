import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import { debounce } from 'lodash';
import { Notify } from 'notiflix';

const DEBOUNCE_DELAY = 300;
const refs = {
  input: document.querySelector('#search-box'),
  list: document.querySelector('.country-list'),
  info: document.querySelector('.country-info'),
};
refs.input.addEventListener(
  'input',
  debounce(() => {
    let value = refs.input.value;

    fetchCountries(value)
      .then(countries => {
        if (countries.length >= 10) {
          clearInnerHtml();
          return Notify.info('Too many matches found. Please enter a more specific name.');
        }

        if (value === '') Notify.info('Type something (=');

        if (countries.length === 1) {
          if (refs.info.innerHTML !== '') return;
          clearInnerHtml();
          addInfo(countries);
        } else {
          clearInnerHtml();
          addList(countries);
        }
      })
      .catch(onError);
  }, DEBOUNCE_DELAY),
);

function addList(countries) {
  const countriesLayout = countries
    .map(country => {
      return `<li>
              <img src="${country.flags.png}" alt="country flag">
              <p>${country.name.common}</p>
            </li>`;
    })
    .join('');

  refs.list.insertAdjacentHTML('afterbegin', countriesLayout);
}

function addInfo([country]) {
  const lang = Object.values(country.languages).reduce((acc, el, arr) => {
    if (arr[arr.length - 1] !== el) return (acc += `${el}, `);
    return (acc += `${el}`);
  }, '');
  const countryLayout = `<div class="country-head">
                    <img src="${country.flags.png}" alt="country flag">
                    <p>${country.name.common}</p>
                  </div>
                  <ul>
                    <li><span class="accent">Capital:</span> ${country.capital[0]}</li>
                    <li><span class="accent">Population:</span> ${country.population}</li>
                    <li><span class="accent">Languages:</span> ${lang}</li>
                  </ul>`;

  refs.info.insertAdjacentHTML('afterbegin', countryLayout);
}

function onError() {
  clearInnerHtml();
  Notify.failure('Oops, there is no country with that name');
}

function clearInnerHtml() {
  refs.info.innerHTML = '';
  refs.list.innerHTML = '';
}
