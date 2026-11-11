import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare, sizePhrase } from '../analogy';
import { withArticle, pluralOf } from '../text';
import { ITEMS } from '../../data/items';
import { FAMILIAR } from '../../data/familiar';

const byId = (id: string) => ITEMS.find((i) => i.id === id)!;

test('headline, fit and analogy read naturally', () => {
  const c = compare(byId('earth'), byId('jupiter'), FAMILIAR);
  assert.equal(c.headline, 'Jupiter is 11 times wider than Earth.');
  assert.equal(c.fit, '11 Earths would fit side by side across Jupiter.');
  assert.match(c.analogy ?? '', /^If Earth were the size of .+, Jupiter would be about .+\.$/);
});

test('mismatched dimensions are spelled out', () => {
  const c = compare(byId('blue-whale'), byId('human'), FAMILIAR);
  assert.equal(c.headline, 'A blue whale is about 18 times longer than a human is tall.');
});

test('grammar helpers', () => {
  assert.equal(withArticle(byId('sun')), 'the Sun');
  assert.equal(withArticle(byId('moon'), { capital: true }), 'The Moon');
  assert.equal(withArticle(byId('e-coli')), 'an E. coli bacterium');
  assert.equal(withArticle(byId('eiffel-tower')), 'the Eiffel Tower');
  assert.equal(withArticle(byId('neutron-star')), 'a neutron star');
  assert.equal(pluralOf(byId('mitochondrion')), 'mitochondria');
  assert.equal(pluralOf(byId('red-blood-cell')), 'red blood cells');
  assert.equal(sizePhrase(byId('human')), '1.7 m tall');
  assert.equal(sizePhrase(byId('challenger-deep')), '10.9 km deep');
});

test('dataset invariants', () => {
  const sorted = [...ITEMS].sort((a, b) => a.size - b.size);
  assert.deepEqual(ITEMS.map((i) => i.id), sorted.map((i) => i.id), 'items are sorted by size');
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length, 'ids are unique');
  for (const i of ITEMS) {
    assert.ok(i.size > 0 && isFinite(i.size), i.id);
    assert.ok(i.name.length <= 28, `${i.id} name too long`);
    assert.ok(i.description.length <= 160, `${i.id} description too long (${i.description.length})`);
    assert.equal(i.facts.length, 2, `${i.id} needs two facts`);
    for (const f of i.facts) assert.ok(f.length <= 150, `${i.id} fact too long (${f.length})`);
    assert.match(i.color, /^#[0-9a-fA-F]{6}$/, `${i.id} colour`);
  }
  // Every pair of neighbours yields a comparison without throwing.
  for (let k = 1; k < ITEMS.length; k++) {
    const c = compare(ITEMS[k - 1], ITEMS[k], FAMILIAR);
    assert.ok(c.headline.length > 10 && c.fit.length > 10, ITEMS[k].id);
  }
});
