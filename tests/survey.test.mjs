import assert from 'node:assert/strict';
import fs from 'node:fs';
import {emptyProfile,validateProfile,rankShows,SURVEY} from '../core.mjs';
import {examples} from './recommendations.test.mjs';
const c=JSON.parse(fs.readFileSync(new URL('../catalog.json',import.meta.url)));
for(const q of SURVEY){const [group,value]=q.key.split(':');assert(value in c.vocabulary[group]);}
for(const [name,p] of Object.entries(examples())){
 const baseline=rankShows(c,p);p.survey=Object.fromEntries(SURVEY.map(q=>[q.key,0]));assert.deepEqual(rankShows(c,p),baseline);
 p.survey={'tone:warm':1,'humor:cringe':-1};const changed=rankShows(c,p);
 console.log('survey',name,changed.slice(0,5).map(x=>`${x.show.title} (${x.score.toFixed(3)})`).join('; '));
 assert.deepEqual(validateProfile(p,c),p);
}
const p=emptyProfile();assert.throws(()=>validateProfile({...p,survey:{fake:1}},c));assert.throws(()=>validateProfile({...p,survey:{'tone:warm':2}},c));
assert.deepEqual(validateProfile({format:p.format,version:2,ratings:{},viewing:{}},c).survey,{});
console.log('Survey neutrality, catalog features, migration and backup validation passed.');
