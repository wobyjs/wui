// Show all permutation steps
const SELECTION_TYPES = [
    'partial-word',      // Select part of a word
    'full-word',         // Select entire word
    'cross-paragraph',   // Select across paragraphs
    'caret'              // Just cursor position
];

const ACTIONS = ['bold', 'italic', 'underline'];

const CLICK_COUNTS = [1, 2, 3, 4, 5, 6, 7];

let testCaseNumber = 0;

console.log('========================================');
console.log('PERMUTATION TEST MATRIX');
console.log('========================================\n');

console.log('Selection Types:', SELECTION_TYPES.length);
SELECTION_TYPES.forEach((type, i) => {
    console.log(`  ${i+1}. ${type}`);
});

console.log('\nActions:', ACTIONS.length);
ACTIONS.forEach((action, i) => {
    console.log(`  ${i+1}. ${action}`);
});

console.log('\nClick Counts:', CLICK_COUNTS.length);
CLICK_COUNTS.forEach((clicks, i) => {
    const toggleState = clicks % 2 === 1 ? 'ON' : 'OFF';
    console.log(`  ${i+1}. ${clicks} click(s) → toggle ${toggleState}`);
});

console.log('\n========================================');
console.log('ALL PERMUTATION STEPS');
console.log('========================================\n');

for (const selectionType of SELECTION_TYPES) {
    for (const action of ACTIONS) {
        for (const clicks of CLICK_COUNTS) {
            testCaseNumber++;
            const toggleState = clicks % 2 === 1 ? 'ON' : 'OFF';
            console.log(`Test ${testCaseNumber}: ${selectionType} + ${action} + ${clicks} click(s) [toggle ${toggleState}]`);
        }
    }
}

console.log('\n========================================');
console.log(`TOTAL TEST CASES: ${testCaseNumber}`);
console.log('========================================');
