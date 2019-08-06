exports.compareHot = function (name1, name2) {
  return (eleA, eleB) => {
    let fir1 = eleA[name1].length
    let sec1 = eleB[name1].length
    if (fir1 === sec1) {
      let fir2 = eleA[name2].length
      let sec2 = eleB[name2].length
      if (fir2 === sec2) {
        return 0
      } else {
        return fir2 > sec2 ? 1 : -1
      }
    } else {
      return fir1 > sec1 ? -1 : 1
    }

  }
}