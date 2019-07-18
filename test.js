let line1 = readline().split(' ')
let grassNum = parseInt(line1[0])
let vol = parseInt(line1[1])
let line2 = readline().split(' ')
let eachVol = []

for (let i = 0; i < line2.length; i++) {
  eachVol.push(parseInt(line2[i]))
}
for (let j = 0; j < grassNum; j++) {
  if (vol === eachVol[j]) {
    vol += vol
  }
}