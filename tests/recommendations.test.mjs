import assert from 'node:assert/strict';
import fs from 'node:fs';
import {emptyProfile,rankShows,ratingEvidence} from '../core.mjs';
const c=JSON.parse(fs.readFileSync(new URL('../catalog.json',import.meta.url)));
export function examples(){
 const empty=emptyProfile(),contrasting=emptyProfile(),contradictory=emptyProfile();
 for(const p of [empty,contrasting,contradictory])for(const s of c.shows)p.viewing[s.id]='not-seen';
 for(const [title,rating] of [['Cheers','yes'],['Frasier','yes'],['South Park','no']]){const s=c.shows.find(s=>s.title===title);contrasting.ratings[s.id]=rating;contrasting.viewing[s.id]='seen';}
 for(const [title,rating] of [['Cheers','yes'],['Frasier','no']]){const s=c.shows.find(s=>s.title===title);contradictory.ratings[s.id]=rating;contradictory.viewing[s.id]='seen';}
 return {empty,contrasting,contradictory};
}
for(const [name,p] of Object.entries(examples())){
 const ranked=rankShows(c,p);assert.deepEqual(ranked,rankShows(c,p));
 assert(ranked.every(r=>p.viewing[r.show.id]==='not-seen'));
 assert(ranked.every(r=>c.views.documented_selection.show_ids.includes(r.show.id)));
 for(const r of ranked)assert(Math.abs(r.score-r.contributions.reduce((s,x)=>s+x.contribution,0))<1e-10);
 console.log(name,ranked.slice(0,5).map(r=>`${r.show.title} (${r.score.toFixed(3)})`).join('; '));
}
const fresh=emptyProfile();assert.equal(rankShows(c,fresh).length,0);assert.equal(rankShows(c,fresh,{includeUnknown:true}).length,165);
assert.equal(rankShows(c,fresh,{includeUnknown:true,includeCandidates:true}).length,304);
fresh.viewing[c.views.documented_selection.show_ids[0]]='seen';assert.equal(rankShows(c,fresh,{includeUnknown:true}).length,164);
const e=ratingEvidence(c,examples().contradictory);assert(Object.values(e).some(x=>x.yes.length&&x.no.length));
console.log('Full-pool, exclusions, determinism, score explanations and contradictory evidence passed.');
