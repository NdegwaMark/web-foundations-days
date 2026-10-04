// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. Return notes whose text contains the word (case-insensitive)
function searchNotes(word, list = notes) {
  return list.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

// 2. Return the note with the most characters, or null if there are no notes
function longestNote(list = notes) {
  if (list.length === 0) {
    return null;
  }
  let longest = list[0];
  for (const note of list) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 3. Count notes per category, e.g. { personal: 2, work: 1, study: 2 }
function countByCategory(list = notes) {
  const counts = {};
  for (const note of list) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. Build a summary sentence, e.g. "5 notes: 2 personal, 1 work, 2 study."
function getSummary(list = notes) {
  const counts = countByCategory(list);
  const parts = Object.entries(counts).map(
    ([category, count]) => `${count} ${category}`
  );
  const word = list.length === 1 ? "note" : "notes";
  return `${list.length} ${word}: ${parts.join(", ")}.`;
}

// 5. Check if a note with the same text already exists
//    (ignoring case and extra spaces)
function isDuplicate(text, list = notes) {
  const cleaned = text.trim().toLowerCase();
  return list.some((note) => note.text.trim().toLowerCase() === cleaned);
}

// 6. Add a note only if it is valid; returns true when added, false otherwise
function addNote(text, category, list = notes) {
  if (text.trim().length < 1 || text.trim().length > 200) {
    console.log("Cannot add note: text must be between 1 and 200 characters.");
    return false;
  }
  if (isDuplicate(text, list)) {
    console.log("Cannot add note: a note with this text already exists.");
    return false;
  }
  if (!["personal", "work", "study"].includes(category)) {
    console.log(
      "Cannot add note: category must be one of personal, work or study."
    );
    return false;
  }
  const newId = list.length > 0 ? Math.max(...list.map((n) => n.id)) + 1 : 1;
  list.push({ id: newId, text: text.trim(), category });
  return true;
}

// ---------- Tests ----------

// searchNotes
console.log(searchNotes("milk"));
// Expected: [ { id: 1, text: "Buy milk and bread", category: "personal" } ]
console.log(searchNotes("zebra"));
// Expected: []

// longestNote
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
console.log(longestNote([]));
// Expected: null

// countByCategory
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }
console.log(countByCategory([]));
// Expected: {}

// getSummary
console.log(getSummary());
// Expected: "5 notes: 2 personal, 2 study, 1 work."
console.log(getSummary([{ id: 1, text: "Buy milk and bread", category: "personal" }]));
// Expected: "1 note: 1 personal."

// isDuplicate
console.log(isDuplicate("  CALL MUM "));
// Expected: true
console.log(isDuplicate("Water the plants"));
// Expected: false

// addNote
console.log(addNote("Walk the dog", "personal"));
// Expected: true
console.log(addNote("Call mum", "personal"));
// Expected: false (duplicate)
console.log(addNote("", "personal"));
// Expected: false (too short)
console.log(addNote("Test note", "fun"));
// Expected: false (invalid category)