const getFiveDigitStr = (int: number) => {
  let res = int.toString();
  while (res.length < 5) {
    res = "0" + res;
  }

  return res;
};

export { getFiveDigitStr };
