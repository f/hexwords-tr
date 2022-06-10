(async function () {
  const words = await (await fetch("https://sozluk.gov.tr/autocomplete.json")).json()

  const HEX_LIKE_CHARS = 'abcdefoiısgğşötz'.split('')

  const result = words
    .map(w => w.madde.toLocaleLowerCase('tr'))
    .filter(w => [3, 6, 8].includes(w.length)) // Colors can be 3 and 6, 8 can be with alpha.
    .filter(w => w
      .split('')
      .every(l => HEX_LIKE_CHARS.includes(l))
    )
    .map(w => [
      w,
      '#' + w.replace(/[iı]/g, '1')
             .replace(/[öo]/g, '0')
             .replace(/[sş]/g, '5')
             .replace(/[ğg]/g, '6')
             .replace(/t/g, '7')
             .replace(/z/g, '2')
             .toLocaleUpperCase('tr')
    ])

  console.log(result);
})();
