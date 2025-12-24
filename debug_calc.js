// Debug calculation comparison

const width = 2800;
const domainSize = 22; // 2002-2023

const align = 0.5;
const paddingInter = 0.2;
const paddingOuter = 0.1;

// TypeScript calculation
const step = Math.round(width / (domainSize + paddingOuter * 2 - paddingInter) * 100) / 100;
const gap = step * paddingInter;
const bandwidth = step - gap;
const paddingLeft = step * paddingOuter * align * 2;

const firstPosX = paddingLeft + bandwidth / 2;

console.log('=== TypeScript Calculation ===');
console.log(`domainSize: ${domainSize}`);
console.log(`step: ${step}`);
console.log(`gap: ${gap}`);
console.log(`bandwidth: ${bandwidth}`);
console.log(`paddingLeft: ${paddingLeft}`);
console.log(`firstPosX: ${firstPosX}`);

// Expected from Python
console.log('\n=== Expected Python Values ===');
console.log(`bandwidth: 101.816`);
console.log(`firstPosX: 62.908`);

// To get posX = 62.908 with bandwidth = 101.816
// paddingLeft = 62.908 - 50.908 = 12
console.log('\n=== Reverse Calculation ===');
const expectedBandwidth = 101.816;
const expectedFirstPosX = 62.908;
const requiredPaddingLeft = expectedFirstPosX - expectedBandwidth / 2;
console.log(`Required paddingLeft: ${requiredPaddingLeft}`);

// If paddingLeft = step * 0.1, then step = paddingLeft / 0.1
const requiredStep = requiredPaddingLeft / 0.1;
console.log(`Required step: ${requiredStep}`);

// bandwidth = step * 0.8, so step = bandwidth / 0.8
const stepFromBandwidth = expectedBandwidth / 0.8;
console.log(`Step from bandwidth: ${stepFromBandwidth}`);
