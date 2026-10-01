const operator = (ratio, level, a, d, s, r, detune = 0) => ({ ratio, level, detune, adsr: { a, d, s, r } });
const drone = { version: 1, name: 'Watching_stone', algorithm: 0, feedback: 1, modIndex: 1.2, ops: [operator(1,0.3,0.4,0.6,0.65,0.5),operator(2,0.18,0.2,0.5,0.3,0.4),operator(0.5,0.2,0.4,0.6,0.7,0.5),operator(1,0.5,0.4,0.7,0.7,0.5)], lfo:{rate:0.3,amDepth:0.12,pmDepth:0.03} };
const bell = { version: 1, name: 'Door_chime', algorithm: 4, feedback: 1, modIndex: 1.5, ops: [operator(2,0.45,0.005,0.14,0.1,0.12),operator(1,0.6,0.005,0.2,0.2,0.15),operator(3,0.25,0.005,0.1,0.05,0.1),operator(1,0.4,0.005,0.2,0.1,0.15)] };
const pulse = { version: 1, name: 'Pursuit', algorithm: 0, feedback: 2, modIndex: 1.8, ops: [operator(1,0.5,0.01,0.1,0.1,0.06),operator(2,0.3,0.01,0.1,0.1,0.06),operator(1,0.25,0.01,0.12,0.1,0.06),operator(1,0.65,0.01,0.15,0.2,0.08)] };
const note = (note,time,duration) => ({note,time,duration});
export const AUDIO = {
  footstepInterval:0.34,
  scores: {
    ambient:{voice:drone,channel:'music',loop:true,duration:12,notes:[note(38,0,2.1),note(45,3,2.1),note(41,6,2.1),note(33,9,2.1)]},
    chase:{voice:pulse,channel:'music',loop:true,duration:4,notes:[38,38,45,38,41,41,36,33].map((n,i)=>note(n,i*0.5,0.22))},
    step:{voice:pulse,channel:'sfx',notes:[note(23,0,0.045)]},
    alert:{voice:bell,channel:'sfx',notes:[note(66,0,0.12),note(69,0.16,0.12)]},
    alarm:{voice:pulse,channel:'sfx',notes:[note(57,0,0.18),note(61,0.22,0.18),note(57,0.44,0.18)]},
    hide:{voice:bell,channel:'sfx',notes:[note(61,0,0.13),note(49,0.16,0.22)]},
    emerge:{voice:bell,channel:'sfx',notes:[note(49,0,0.13),note(61,0.16,0.22)]},
    escape:{voice:bell,channel:'sfx',notes:[note(62,0,0.2),note(69,0.25,0.2),note(74,0.5,0.6)]},
    caught:{voice:pulse,channel:'sfx',notes:[note(45,0,0.25),note(38,0.28,0.4)]}
  }
};
