/**
 * @internalapi
 * @module vanilla
 */
/** */
import {
  LocationConfig, LocationServices, identity, unnestR, isArray, splitEqual, splitHash, splitQuery
} from "../common";
import { UIRouter } from "../router";

export const keyValsToObjectR = (accum, [key, val]) => {
  if (!accum.hasOwnProperty(key)) {
    accum[key] = val;
  } else if (isArray(accum[key])) {
    accum[key].push(val);
  } else {
    accum[key] = [accum[key], val]
  }
  return accum;
};

export const getParams = (queryString: string): any =>
    queryString.split("&").filter(identity).map(splitEqual).reduce(keyValsToObjectR, {});

export function parseUrl(url: string) {
  const orEmptyString = x => x || "";
  let [beforehash, hash] = splitHash(url).map(orEmptyString);
  let [path, search] = splitQuery(beforehash).map(orEmptyString);

  return { path, search, hash, url };
}

export const buildUrl = (loc: LocationServices) => {
  let path = loc.path();
  let searchObject = loc.search();
  let hash = loc.hash();

  let search = Object.keys(searchObject).map(key => {
    let param = searchObject[key];
    let vals = isArray(param) ? param : [param];
    return vals.map(val => key + "=" + val);
  }).reduce(unnestR, []).join("&");

  return path + (search ? "?" + search : "") + (hash ? "#" + hash : "");
};

export function locationPluginFactory(
    name: string,
    isHtml5: boolean,
    serviceClass: { new(router?: UIRouter): LocationServices },
    configurationClass: { new(router?: UIRouter, isHtml5?: boolean): LocationConfig }
) {
  return function(router: UIRouter) {
    let service       = router.locationService = new serviceClass(router);
    let configuration = router.locationConfig  = new configurationClass(router, isHtml5);

    function dispose(router: UIRouter) {
      router.dispose(service);
      router.dispose(configuration);
    }

    return { name, service, configuration, dispose };
  };
}
