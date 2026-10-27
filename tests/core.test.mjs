import assert from 'node:assert/strict';
import fs from 'node:fs';
import {emptyProfile,validateProfile} from '../core.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../catalog.json',import.meta.url)));
const id=catalog.shows[0].id;
const p=emptyProfile();p.ratings[id]='yes';assert.deepEqual(validateProfile(p,catalog),p);
for(const raw of [{},{...p,version:99},{...p,ratings:{bogus:'yes'}},{...p,ratings:{[id]:'love'}}])assert.throws(()=>validateProfile(raw,catalog));
const alias=Object.entries(catalog.id_aliases).find(([old,id])=>old!==id);assert.equal(validateProfile({...p,ratings:{[alias[0]]:'meh'}},catalog).ratings[alias[1]],'meh');
console.log('Profile validation and alias tests passed.');
