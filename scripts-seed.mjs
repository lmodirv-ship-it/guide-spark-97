import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const data = JSON.parse(fs.readFileSync('/tmp/countries.json','utf8'));

function slugify(s){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'x';}

const countries = data.map(c=>{
  const code=c.cca2; if(!code) return null;
  const name_en=c.name?.common||'';
  const name_ar=c.translations?.ara?.common||name_en;
  const name_fr=c.translations?.fra?.common||name_en;
  const currs=c.currencies||{}; const currency=Object.keys(currs)[0]||null;
  const idd=c.idd||{}; const root=idd.root||''; const sufs=idd.suffixes||[];
  const phone_code=(root+(sufs.length===1?sufs[0]:''))||null;
  const langs=c.languages?Object.values(c.languages).join(', '):null;
  return {code, name_ar, name_fr, name_en, slug:slugify(name_en||code), flag_emoji:c.flag||null, currency, phone_code, languages:langs};
}).filter(Boolean);

console.log('Upserting', countries.length, 'countries');
const {error: e1} = await sb.from('countries').upsert(countries, {onConflict:'code'});
if(e1){console.error('countries err', e1); process.exit(1);}

const {data: cmap} = await sb.from('countries').select('id,code');
const idByCode = Object.fromEntries(cmap.map(r=>[r.code,r.id]));

const cities=[];
for(const c of data){
  const code=c.cca2; const cid=idByCode[code]; if(!cid) continue;
  const caps=c.capital||[];
  const ll=(c.capitalInfo&&c.capitalInfo.latlng)||c.latlng||[];
  for(const cap of caps){
    cities.push({country_id:cid, name_ar:cap, name_fr:cap, name_en:cap, slug:slugify(cap+'-'+code), latitude:ll[0]??null, longitude:ll[1]??null});
  }
}
console.log('Inserting', cities.length, 'capital cities');
// fetch existing to dedup
const {data: existing} = await sb.from('cities').select('country_id,name_en');
const seen = new Set(existing.map(r=>r.country_id+'|'+(r.name_en||'').toLowerCase()));
const fresh = cities.filter(c=>!seen.has(c.country_id+'|'+c.name_en.toLowerCase()));
console.log('Fresh:', fresh.length);
// chunk
for(let i=0;i<fresh.length;i+=200){
  const chunk=fresh.slice(i,i+200);
  const {error} = await sb.from('cities').insert(chunk);
  if(error){console.error('cities err',error); process.exit(1);}
}
console.log('Done');
