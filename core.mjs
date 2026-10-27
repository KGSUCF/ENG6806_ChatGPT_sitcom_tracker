// Pure data functions: no browser or storage access, so they are easy to test.
export const FORMAT = 'couch-committee-profile';
export const VERSION = 1;
export const STORAGE_KEY = 'couch-committee-profile';
export const emptyProfile = () => ({format:FORMAT,version:VERSION,ratings:{}});
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export function validateProfile(raw,catalog){
  if(!object(raw)||raw.format!==FORMAT||raw.version!==1||!object(raw.ratings)) throw Error('Not a supported Couch Committee backup.');
  const next=emptyProfile(), ids=new Set(catalog.shows.map(s=>s.id));
  for(const [old,rating] of Object.entries(raw.ratings)){
    const id=Object.hasOwn(catalog.id_aliases,old)?catalog.id_aliases[old]:old;
    if(!ids.has(id))throw Error(`Unknown show ID: ${old}`);
    if(!['yes','meh','no'].includes(rating))throw Error(`Invalid rating for ${old}`);
    if(Object.hasOwn(next.ratings,id))throw Error(`Two entries refer to ${id}; resolve the duplicate before importing.`);
    next.ratings[id]=rating;
  }
  return next;
}
