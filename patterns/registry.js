// patterns/registry.js - Pattern registry

const BlurShield = (() => {
  const allPatterns = [];

  function registerPatterns(patterns) {
    for (const p of patterns) {
      allPatterns.push(p);
    }
  }

  function getEnabledPatterns(enabledCategories) {
    return allPatterns.filter(p => enabledCategories[p.category]);
  }

  function getAllPatterns() {
    return allPatterns.slice();
  }

  return { registerPatterns, getEnabledPatterns, getAllPatterns };
})();
