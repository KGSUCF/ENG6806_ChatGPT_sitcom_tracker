// Pure data functions: no browser or storage access, so they are easy to test.
export const FORMAT = 'couch-committee-profile';
export const VERSION = 2;
export const STORAGE_KEY = 'couch-committee-profile';
export const emptyProfile = () => ({format:FORMAT,version:VERSION,ratings:{},viewing:{}});
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export function validateProfile(raw,catalog){
  if(!object(raw)||raw.format!==FORMAT||![1,2].includes(raw.version)||!object(raw.ratings)) throw Error('Not a supported Couch Committee backup.');
  const next=emptyProfile(), ids=new Set(catalog.shows.map(s=>s.id));
  for(const [old,rating] of Object.entries(raw.ratings)){
    const id=Object.hasOwn(catalog.id_aliases,old)?catalog.id_aliases[old]:old;
    if(!ids.has(id))throw Error(`Unknown show ID: ${old}`);
    if(!['yes','meh','no'].includes(rating))throw Error(`Invalid rating for ${old}`);
    if(Object.hasOwn(next.ratings,id))throw Error(`Two entries refer to ${id}; resolve the duplicate before importing.`);
    next.ratings[id]=rating;
  }
  if(raw.version>=2){
    if(!object(raw.viewing))throw Error('Missing viewing history.');
    for(const [old,status] of Object.entries(raw.viewing)){
      const id=Object.hasOwn(catalog.id_aliases,old)?catalog.id_aliases[old]:old;
      if(!ids.has(id)||!['unknown','seen','not-seen'].includes(status))throw Error(`Invalid viewing entry: ${old}`);
      if(Object.hasOwn(next.viewing,id))throw Error(`Duplicate viewing entry: ${id}`);
      next.viewing[id]=status;
    }
  }
  for(const id of Object.keys(next.ratings)){
    if(raw.version>=2 && next.viewing[id]!=='seen')throw Error(`Rated show must be Seen: ${id}`);
    next.viewing[id]='seen';
  }
  return next;
}

export const statusOf=(profile,id)=>profile.viewing[id]||'unknown';
export function setViewing(profile,id,status){
  const next=structuredClone(profile);next.viewing[id]=status;
  if(status!=='seen')delete next.ratings[id];
  return next;
}
