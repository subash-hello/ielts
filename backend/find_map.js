const fs = require('fs');
fetch('https://engnovate.com/ielts-listening-tests/cambridge-ielts-19-general-training-listening-test-1/')
  .then(r => r.text())
  .then(t => {
    const matches = t.match(/https?:\/\/[^\s"'<>]+(?:png|jpg|jpeg)/gi) || [];
    console.log([...new Set(matches)]);
  });
