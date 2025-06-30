export function createPropListMatcher(propList: string[]) {
  const hasWildcard = propList.includes('*');
  const matchList = propList.filter((p) => !p.startsWith('!'));
  const ignoreList = propList.filter((p) => p.startsWith('!')).map((p) => p.slice(1));

  function matches(prop: string, list: string[]) {
    return list.some((pattern) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('*')) return prop.startsWith(pattern.slice(0, -1));
      return prop === pattern;
    });
  }

  return (prop: string) => {
    if (hasWildcard && !matches(prop, ignoreList)) return true;
    return matches(prop, matchList) && !matches(prop, ignoreList);
  };
}
