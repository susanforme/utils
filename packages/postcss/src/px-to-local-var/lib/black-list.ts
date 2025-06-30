export function createSelectorBlackList(blackList: (string | RegExp)[]) {
  return (selector: string) => {
    return blackList.some((item) => {
      if (typeof item === 'string') return selector.includes(item);
      return item.test(selector);
    });
  };
}
