//one off investigation script, not part off the app
//run with node scripts/sprite-spike.mjs

//for a spread of pokemon ids across generations, ask pokeAPI which sprite/cry fields actually exist
//and print a table of yes/no answers.

const IDS = [
  1, 4, 25, 94, 133, 150, 151, 251, 386, 493, 494, 649, 650, 721, 722, 809, 810,
  905, 906, 1025,
];

//small helper: turn a "value exists into a short symbol for the table"
const has = (value) => (value ? "yes" : "-");

async function inspect(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) {
    return { id, name: `HTTP ${res.status}` };
  }
  const data = await res.json();
  const s = data.sprites ?? {};

  //optional chaining (?.) means "if the left side is missing, stop and give undefined"
  //instead of crashing. thats exactly what we want for a shape were still learning
  const blackWhite = s.versions?.["generation-v"]?.["black-white"];

  return {
    id,
    name: data.name,
    bwAnimated: has(blackWhite?.animated?.front_default),
    bwStatic: has(blackWhite?.front_default),
    platinum: has(s.versions?.["generation-iv"]?.platinum?.front_default),
    showdown: has(s.other?.showdown?.front_default),
    artwork: has(s.other?.["official-artwork"]?.front_default),
    home: has(s.other?.home?.front_default),
    cry: has(data.cries?.latest),
  };
  //first look at the shape of the data for one pokemon, so we stop guessing
  const first = await (
    await fetch("https://pokeapi.co/api/v2/pokemon/1")
  ).json();
  console.log(
    "sprites.versions keys:",
    Object.keys(first.sprites?.versions ?? {}),
  );
  console.log(
    "sprites.other keys:   ",
    Object.keys(first.sprites?.other ?? {}),
  );
  console.log("top-level keys with 'cries':", "cries" in first);

  //then the coverage table. sequential on purpose: 20 requests is small,
  //and being gentle with a free public API is good manners.
  const rows = [];
  for (const id of IDS) {
    rows.push(await inspect(id));
  }

  console.table(rows);
}
